import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { config } from 'dotenv';
config({path:'.env.local'});config();
// Bundle the same defaults and optional siteOverrides.json used by the browser.
const bundle=await build({stdin:{contents:`export { initialClinic as clinic } from './src/data/siteDefaults'; export { conditionsData as conditions } from './src/data/clinicData'; export { defaultPublicTeamMembers as team } from './src/data/defaultTeamData'; export { defaultBlogPosts as posts } from './src/data/defaultPosts';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node',loader:{'.jpg':'dataurl','.png':'dataurl','.webp':'dataurl'},define:{'import.meta.env.VITE_DEFAULT_PRESET':JSON.stringify(process.env.VITE_DEFAULT_PRESET || '')}});
const data=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
const clinic=data.clinic;
const slug=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const esc=(v:unknown)=>String(v || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const routes:Array<{url:string;title:string;desc?:string;private?:boolean}>=[
 ...[['','Home'],['conditions','Conditions'],['first-visit','First Visit'],['about','About'],['team','Our Team'],['contact','Contact'],['pricing','Pricing & Fees'],['blog','Clinical Blog'],['privacy','Privacy Policy'],['terms','Terms of Service']].map(([url,title])=>({url,title})),
 {url:'portal',title:'Patient Portal',private:true},{url:'patient-portal',title:'Patient Portal',private:true},
 ...(clinic.customConditions ?? data.conditions).map((c:any)=>({url:`conditions/${c.slug || slug(c.title || c.id)}`,title:c.title,desc:c.description})),
 ...(clinic.publicTeamMembers ?? data.team).filter((m:any)=>m.showOnWebsite!==false).map((m:any)=>({url:`team/${m.slug || slug(m.name)}`,title:m.name})),
 ...(clinic.customPosts ?? data.posts).filter((p:any)=>p.status!=='draft').map((p:any)=>({url:`blog/${p.slug}`,title:p.title,desc:p.excerpt})),
];
const base=process.env.VITE_APP_URL?.replace(/\/$/,'');
if(base && !/^https?:\/\//.test(base))throw new Error('VITE_APP_URL must be an absolute HTTP(S) URL');
const template=fs.readFileSync('dist/index.html','utf8');
for(const r of routes){
 if(r.url && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(r.url)) throw new Error('Invalid public route slug: '+r.url);
 const title=`${r.title} | ${clinic.seoTitle || clinic.name}`;
 const description=r.desc || clinic.seoDescription || clinic.tagline || clinic.name;
 let html=template.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(title)+'</title>')
 .replace(/<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/g,'')
 .replace(/<link\s+rel=["']canonical["'][^>]*>/g,'')
 .replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/g,'');
 const url=base?`${base}/${r.url}${r.url?'/':''}`:'';
 html=html.replace('</head>',`<meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">${url?`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}">`:''}${r.private?'<meta name="robots" content="noindex,nofollow">':''}</head>`);
 // Static introductory content is removed by React on client mount.
 html=html.replace('<div id="root"></div>',`<div id="root"><main><h1>${esc(r.title)}</h1><p>${esc(description)}</p></main></div>`);
 const dir=path.join('dist',r.url);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);
}
if(base){fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>!r.private).map(r=>`<url><loc>${esc(`${base}/${r.url}${r.url?'/':''}`)}</loc></url>`).join('')}</urlset>`);}
fs.writeFileSync('dist/robots.txt',`User-agent: *\nDisallow: /portal\nDisallow: /patient-portal\n${base?'Sitemap: '+base+'/sitemap.xml\n':''}`);
console.log(`Generated metadata and introductory HTML for ${routes.length} routes from shared clinic data.${base?'':' Configure VITE_APP_URL to include canonical URLs and sitemap.'}`);
