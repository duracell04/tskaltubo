insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('evidence','evidence',false,10485760,array['application/pdf','image/png','image/jpeg','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel']) on conflict(id) do nothing;
create policy evidence_insert on storage.objects for insert to authenticated with check(bucket_id='evidence' and (storage.foldername(name))[1]=auth.uid()::text and public.is_member());
create policy evidence_read on storage.objects for select to authenticated using(bucket_id='evidence' and (public.is_admin() or ((storage.foldername(name))[1]=auth.uid()::text and public.is_member())));
-- No client overwrite/delete; publication serves validated files through the server.
