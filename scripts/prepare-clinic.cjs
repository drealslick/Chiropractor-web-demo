// Explicit Admin SDK maintenance. Defaults to a read-only plan; never imports patients.
const {createRequire}=require('node:module');
const req=createRequire(require('node:path').resolve('functions/package.json'));
const fs=require('node:fs');
const project=process.env.GCLOUD_PROJECT, clinicId=process.env.VITE_CLINIC_ID;
if(!project || !/^[\w-]+$/.test(clinicId || '')) throw Error('Set GCLOUD_PROJECT and VITE_CLINIC_ID explicitly.');
const apply=process.argv.includes('--apply');
if(apply && process.env.CONFIRM_PROJECT!==project) throw Error('Set CONFIRM_PROJECT to the exact target project before applying.');
const {initializeApp}=req('firebase-admin/app'), {getFirestore}=req('firebase-admin/firestore');
initializeApp({projectId:project}); const db=getFirestore();
(async()=>{
 let pendingConfig;
 const file=process.argv.find(x=>x.startsWith('--config='))?.slice(9);
 if(file) {
  const config=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!config.name || !config.schedulingRules || !config.publicTeamMembers || !config.timeZone) throw Error('Export a complete approved clinic configuration, including schedule, team and timezone.');
  const drafts=(config.customPosts || []).filter(p=>p.status==='draft');
  config.customPosts=(config.customPosts || []).filter(p=>p.status!=='draft');
  console.log('Clinic configuration validated. Private drafts:',drafts.length);
  pendingConfig={config,drafts};
 }
 // Run with online booking paused. Include existing active records before enabling reservations.
 const snapshot=await db.collection('appointments').where('clinicId','==',clinicId).get();
 const groups=new Map();let unresolved=0;
 const {minutes,overlap}=require('../functions/lib/booking');
 for(const doc of snapshot.docs){
  const a=doc.data();
  if(a.source!=='booking' || ['cancelled','archived','waitlist'].includes(a.status))continue;
  if(!a.patientId || !a.practitionerId || !/^\d{4}-\d{2}-\d{2}$/.test(a.date || '') || !a.durationMinutes || !a.priceMinor || !a.currency){unresolved++;continue;}
  const key=`${clinicId}_${a.practitionerId}_${a.date}`,slots=groups.get(key)||[];
  const clinic=pendingConfig?.config || (await db.doc(`clinics/${clinicId}`).get()).data();
  const slot={id:doc.id,start:minutes(a.time),end:minutes(a.time)+a.durationMinutes+Number(clinic?.schedulingRules?.bufferTimeMinutes||0)};
  if(slots.some(s=>overlap(s,slot)))throw Error('Existing overlapping appointments require staff reconciliation; no reservations written.');
  slots.push(slot);groups.set(key,slots);
 }
 if(unresolved)throw Error(`${unresolved} legacy appointments need verified UID/clinician/date/duration/price/currency mapping. No reservations written. Never infer ownership solely from an unverified email.`);
 console.log('Reservation days validated:',groups.size,'Mode:',apply?'APPLY':'DRY RUN');
 if(apply && pendingConfig){const batch=db.batch();batch.set(db.doc(`clinics/${clinicId}`),pendingConfig.config);batch.set(db.doc(`clinic_drafts/${clinicId}`),{posts:pendingConfig.drafts});await batch.commit();}
 if(apply)for(const [key,reservations] of groups)await db.doc(`reservation_days/${key}`).set({reservations});
})().catch(e=>{console.error(e.message);process.exitCode=1;});
