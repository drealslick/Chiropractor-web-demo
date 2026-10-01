import {beforeAll,afterAll,beforeEach,it,expect} from 'vitest';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {readFileSync} from 'node:fs';
let env:any;
beforeAll(async()=>{env=await initializeTestEnvironment({projectId:'demo-review-boundaries',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9199,rules:readFileSync('storage.rules','utf8')}})});
afterAll(async()=>{await env.cleanup()});
beforeEach(async()=>{await env.clearFirestore()});
const patient=()=>env.authenticatedContext('patient-a',{role:'patient',clinicId:'clinic-a',superAdmin:false,admin:false});
const staff=()=>env.authenticatedContext('staff-a',{role:'staff',clinicId:'clinic-a',superAdmin:false,admin:false});
it('Regression denies: patient can mark own appointment fully paid',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('appointments/a').set({patientId:'patient-a',clinicId:'clinic-a',paymentStatus:'unpaid'}));
 await assertFails(patient().firestore().doc('appointments/a').update({paymentStatus:'paid_full',amountPaid:999}));
});
it('Regression denies: patient can transfer appointment ownership and clinic',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('appointments/a').set({patientId:'patient-a',clinicId:'clinic-a'}));
 await assertFails(patient().firestore().doc('appointments/a').update({patientId:'someone-else',clinicId:'clinic-b'}));
});
it('Regression denies: clinic-a staff can overwrite clinic-b public post by relabeling tenant',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('blogPosts/b').set({clinicId:'clinic-b',title:'B original'}));
 await assertFails(staff().firestore().doc('blogPosts/b').set({clinicId:'clinic-a',title:'Overwritten by A'}));
});
it('Regression denies: patient reads clinic-wide invoices without invoice ownership',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('invoices/b').set({clinicId:'clinic-a',patientId:'patient-b',amount:200}));
 await assertFails(patient().firestore().doc('invoices/b').get());
});
it('Regression denies: patients profile collection used by registration is denied',async()=>{
 await assertFails(patient().firestore().doc('patients/patient-a').set({name:'Synthetic'}));
});
it('Regression denies: unscoped appointments subscription query denied to staff',async()=>{
 await assertFails(staff().firestore().collection('appointments').get());
});
it('Regression denies: guest booking matching UI shape denied',async()=>{
 await assertFails(env.unauthenticatedContext().firestore().doc('appointments/new').set({name:'Synthetic',email:'review@example.invalid',clinicName:'Clinic A'}));
});
it('Regression denies: patient with matching clinic claim uploads clinic media',async()=>{
 await assertFails(patient().storage().ref('clinics/clinic-a/review.png').put(new Uint8Array([1,2,3]),{contentType:'image/png'}));
});
it('Regression denies: staff in clinic-a reads another patient upload without tenant match',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.storage().ref('patients/patient-b/review.txt').put(new Uint8Array([1,2,3]),{contentType:'text/plain'}));
 await assertFails(staff().storage().ref('patients/patient-b/review.txt').getDownloadURL());
});
it('FIXTURE CONTROL: own-clinic admin update succeeds after seeding clinic',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('clinics/clinic-a').set({name:'Before'}));
 await assertSucceeds(env.authenticatedContext('admin-a',{role:'admin',clinicId:'clinic-a',superAdmin:false}).firestore().doc('clinics/clinic-a').update({name:'After'}));
});

it('allows safe self-profile creation but denies role injection',async()=>{
 const ref=patient().firestore().doc('users/patient-a');
 await assertSucceeds(ref.set({id:'patient-a',name:'Test',email:'review@example.invalid',phone:'',createdAt:'2026-10-01'}));
 await assertFails(ref.update({role:'admin'}));
});
it('allows tenant-qualified staff uploads but denies another clinic',async()=>{
 await assertSucceeds(staff().storage().ref('patient_records/clinic-a/patient-a/review.png').put(new Uint8Array([1]),{contentType:'image/png'}));
 await assertFails(staff().storage().ref('patient_records/clinic-b/patient-b/review.png').put(new Uint8Array([1]),{contentType:'image/png'}));
});
it('private drafts are not readable anonymously',async()=>{
 await env.withSecurityRulesDisabled(async(c:any)=>c.firestore().doc('clinic_drafts/clinic-a').set({posts:[{title:'Private'}]}));
 await assertFails(env.unauthenticatedContext().firestore().doc('clinic_drafts/clinic-a').get());
});
