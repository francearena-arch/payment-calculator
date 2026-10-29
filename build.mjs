import {build} from 'esbuild';
import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
await build({entryPoints:['lib/app.js'],bundle:true,minify:true,outfile:'dist/app.js',platform:'browser',target:['es2022']});
