import fs from 'node:fs';
const origin=process.argv[2]??'http://127.0.0.1:4173';
const data=JSON.parse(fs.readFileSync('src/data/research.json','utf8'));
const failures=[];let routes=0;
for(const locale of ['de','en','ka'])for(const suffix of ['', '/sanatoriums','/scenarios','/compare','/finance','/evidence','/report','/methodology',...data.assets.map(a=>'/sanatoriums/'+a.id)]){const r=await fetch(`${origin}/${locale}${suffix}/`);const body=await r.text();routes++;if(r.status!==200||!body.includes('Tskaltubo'))failures.push(`${locale}${suffix}: ${r.status}`);}
for(const route of ['/fr/','/en/nonexistent/','/en/sanatoriums/nonexistent/','/auth/callback','/api/workspace','/api/uploads','/api/export']){const r=await fetch(origin+route);if(r.status!==404)failures.push(`${route}: expected 404, got ${r.status}`);}
for(const locale of ['en','de','ka'])for(const old of ['workspace','diligence']){const r=await fetch(`${origin}/${locale}/${old}`,{redirect:'manual'});if(![301,302,308].includes(r.status))failures.push(`Missing redirect ${locale}/${old}`);}
const exported=await fetch(origin+'/data/research.json').then(r=>r.json());if(exported.assets.length!==11||exported.concepts.length!==7||exported.reportSha256!==data.reportSha256)failures.push('Static research export differs');
const write=await fetch(origin+'/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(write.status!==404)failures.push('Removed write endpoint remains active');
console.log(JSON.stringify({routes,assets:exported.assets.length,concepts:exported.concepts.length,failures},null,2));if(failures.length)process.exitCode=1;
