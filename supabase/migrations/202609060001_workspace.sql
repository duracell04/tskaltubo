create table public.memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','contributor')),
 display_name text not null default 'Collaborator', active boolean not null default true
);
create table public.invitations (
 email text primary key check(email=lower(email)), role text not null check(role in ('admin','contributor')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '14 days', accepted_by uuid references auth.users(id), revoked boolean not null default false
);
create table public.records (
 id text primary key, kind text not null check(kind in ('property','concept','claim','source','risk','decision','gate','task','contribution','model','document')),
 title text not null check(length(title) between 1 and 300), body jsonb not null default '{}',
 status text not null default 'draft' check(status in ('draft','published')), version integer not null default 1,
 author_id uuid references auth.users(id), assigned_to uuid references auth.users(id),
 parent_id text references public.records(id), base_version integer,
 updated_at timestamptz not null default now(), rationale text not null
);
create table public.revisions (
 id bigint generated always as identity primary key, record_id text not null references public.records(id),
 version integer not null, snapshot jsonb not null, actor_id uuid references auth.users(id),
 rationale text not null, created_at timestamptz not null default now(),unique(record_id,version)
);
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from memberships where user_id=auth.uid() and active and role='admin');
$$;
create function public.is_member() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from memberships where user_id=auth.uid() and active);
$$;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.records enable row level security;
alter table public.revisions enable row level security;
create policy membership_read on public.memberships for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy invitation_read on public.invitations for select to authenticated using(public.is_admin());
create policy record_read on public.records for select to anon,authenticated using(status='published' or public.is_admin() or (public.is_member() and author_id=auth.uid()));
create policy revision_read on public.revisions for select to authenticated using(public.is_admin());
grant select on public.records to anon,authenticated;
grant select on public.memberships,public.invitations,public.revisions to authenticated;
revoke insert,update,delete on public.records,public.revisions,public.memberships,public.invitations from anon,authenticated;
create function public.accept_invitation() returns boolean language plpgsql security definer set search_path=public as $$
declare mail text; invite invitations;
begin
 select lower(email) into mail from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if mail is null then raise exception 'Verified identity required'; end if;
 select * into invite from invitations where email=mail and not revoked and expires_at>now() and (accepted_by is null or accepted_by=auth.uid()) for update;
 if not found then return false; end if;
 insert into memberships(user_id,role) values(auth.uid(),invite.role) on conflict(user_id) do update set active=true,role=excluded.role;
 update invitations set accepted_by=auth.uid() where email=mail;return true;
end;$$;
create function public.manage_invitation(p_email text,p_role text,p_revoke boolean default false) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'Administrator required';end if;
 if p_role not in ('admin','contributor') or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Invalid invitation';end if;
 insert into invitations(email,role,revoked) values(lower(p_email),p_role,p_revoke)
 on conflict(email) do update set role=excluded.role,revoked=excluded.revoked,expires_at=now()+interval '14 days';
 if p_revoke then update memberships set active=false where user_id in(select accepted_by from invitations where email=lower(p_email));end if;
end;$$;
create function public.create_record(p_id text,p_kind text,p_title text,p_body jsonb,p_rationale text,p_parent text default null,p_base_version integer default null) returns public.records language plpgsql security definer set search_path=public as $$
declare r records;
begin
 if not public.is_member() then raise exception 'Invitation required';end if;
 if length(trim(p_rationale))<8 or octet_length(p_body::text)>1000000 then raise exception 'Rationale or body invalid';end if;
 if p_parent is not null and not exists(select 1 from records where id=p_parent and status='published' and kind=p_kind and version=p_base_version) then raise exception 'Revision conflict or parent not found';end if;
 if not public.is_admin() and p_parent is null and p_kind not in ('contribution','model','document','source','claim') then raise exception 'Submit a proposal against an existing record';end if;
 insert into records(id,kind,title,body,author_id,rationale,parent_id,base_version) values(p_id,p_kind,p_title,p_body-'fileChecked',auth.uid(),p_rationale,p_parent,p_base_version) returning * into r;
 insert into revisions(record_id,version,snapshot,actor_id,rationale) values(r.id,r.version,to_jsonb(r),auth.uid(),p_rationale);return r;
end;$$;
create function public.update_task(p_id text,p_version integer,p_status text,p_rationale text) returns public.records language plpgsql security definer set search_path=public as $$
declare r records;
begin
 if not public.is_member() or p_status not in ('not_started','in_progress','blocked','done') or length(trim(p_rationale))<8 then raise exception 'Invalid task update';end if;
 select * into r from records where id=p_id and kind='task' for update;
 if not found or (not public.is_admin() and r.assigned_to is distinct from auth.uid()) then raise exception 'Assigned collaborator required';end if;
 if r.version<>p_version then raise exception 'Revision conflict';end if;
 update records set body=jsonb_set(body,'{status}',to_jsonb(p_status)),version=version+1,updated_at=now(),rationale=p_rationale where id=p_id returning * into r;
 insert into revisions(record_id,version,snapshot,actor_id,rationale) values(r.id,r.version,to_jsonb(r),auth.uid(),p_rationale);return r;
end;$$;
create function public.publish_record(p_id text,p_version integer,p_rationale text) returns public.records language plpgsql security definer set search_path=public as $$
declare r records; target records; evidence text;
begin
 if not public.is_admin() or length(trim(p_rationale))<8 then raise exception 'Administrator and rationale required';end if;
 select * into r from records where id=p_id for update;
 if not found or r.version<>p_version or r.status<>'draft' then raise exception 'Revision conflict';end if;
 if r.body->>'verification'='verified' and (coalesce(r.body->>'verifiedAt','') !~ '^\d{4}-\d{2}-\d{2}$' or length(coalesce(r.body->>'verificationNote',''))<8) then raise exception 'Verification requires a date and documented primary-source check';end if;
 if r.kind='gate' and r.body->>'status'='approved' then
  if jsonb_typeof(r.body->'evidenceIds') is distinct from 'array' or jsonb_array_length(r.body->'evidenceIds')=0 then raise exception 'Gate decision requires published evidence';end if;
  for evidence in select jsonb_array_elements_text(r.body->'evidenceIds') loop
   if not exists(select 1 from records where id=evidence and status='published' and kind in ('source','claim','document')) then raise exception 'Gate evidence not published';end if;
  end loop;
 end if;
 if r.kind='document' and coalesce(r.body->>'fileChecked','false')<>'true' then raise exception 'Document must pass server file validation';end if;
 if r.parent_id is not null then
  select * into target from records where id=r.parent_id for update;
  if target.version<>r.base_version or target.kind='model' then raise exception 'Revision conflict or immutable model';end if;
  update records set body=r.body,title=r.title,version=version+1,updated_at=now(),rationale=p_rationale where id=target.id returning * into target;
  insert into revisions(record_id,version,snapshot,actor_id,rationale) values(target.id,target.version,to_jsonb(target),auth.uid(),p_rationale);
 end if;
 update records set status='published',version=version+1,updated_at=now(),rationale=p_rationale where id=p_id returning * into r;
 insert into revisions(record_id,version,snapshot,actor_id,rationale) values(r.id,r.version,to_jsonb(r),auth.uid(),p_rationale);return r;
end;$$;
create function public.assign_task(p_id text,p_version integer,p_user uuid,p_rationale text) returns void language plpgsql security definer set search_path=public as $$
declare r records;
begin
 if not public.is_admin() or length(trim(p_rationale))<8 then raise exception 'Administrator required';end if;
 if p_user is not null and not exists(select 1 from memberships where user_id=p_user and active) then raise exception 'Active member required';end if;
 update records set assigned_to=p_user,version=version+1,updated_at=now(),rationale=p_rationale where id=p_id and kind='task' and version=p_version returning * into r;
 if not found then raise exception 'Revision conflict';end if;
 insert into revisions(record_id,version,snapshot,actor_id,rationale) values(r.id,r.version,to_jsonb(r),auth.uid(),p_rationale);
end;$$;
revoke all on function public.accept_invitation(),public.manage_invitation(text,text,boolean),public.create_record(text,text,text,jsonb,text,text,integer),public.update_task(text,integer,text,text),public.publish_record(text,integer,text),public.assign_task(text,integer,uuid,text) from public,anon;
grant execute on function public.accept_invitation(),public.manage_invitation(text,text,boolean),public.create_record(text,text,text,jsonb,text,text,integer),public.update_task(text,integer,text,text),public.publish_record(text,integer,text),public.assign_task(text,integer,uuid,text) to authenticated;
