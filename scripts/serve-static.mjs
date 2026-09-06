// Local verification server only. Production deploys contain static files, not this process.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'out'),port=Number(process.argv[3]??4173);
const redirects=fs.readFileSync(path.join(root,'_redirects'),'utf8').replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.trim().split(/\s+/)).filter(x=>x.length===3);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const redirect=redirects.find(r=>r[0]===pathname);if(redirect){res.writeHead(Number(redirect[2]),{Location:redirect[1]});res.end();return;}let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream'});fs.createReadStream(file).pipe(res);}).listen(port,'127.0.0.1',()=>console.log(`Static memo: http://127.0.0.1:${port}`));
