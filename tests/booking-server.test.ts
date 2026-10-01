import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {bookingHandlers} from '../functions/src/booking';
const require=createRequire(new URL('../functions/package.json',import.meta.url));
const adminApp=require('firebase-admin/app');
const adminDb=require('firebase-admin/firestore');
let app:any,db:any,handlers:ReturnType<typeof bookingHandlers>,api:any;
let claims:any[]=[];let intents:any[]=[];
const patient:any={auth:{uid:'patient-a',token:{role:'patient',clinicId:'clinic-a'}}};
const staff:any={auth:{uid:'staff-a',token:{role:'admin',clinicId:'clinic-a'}}};
const hours={enabled:true,openTime:'08:00',closeTime:'18:00',lunchBreakEnabled:false};
const clinic={name:'Test',examFee:'$49',followUpFee:'$35',currencySymbol:'$',timeZone:'America/New_York',publicTeamMembers:[{id:'doctor-a',name:'Test Doctor'}],schedulingRules:{slotDurationMinutes:45,bufferTimeMinutes:15,weeklySchedule:Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(k=>[k,hours]))},paymentPolicy:{depositAmount:25}};
const booking=(id='A',time='10:00 AM')=>({id,clinicId:'clinic-a',patch:{name:'Synthetic',email:'test@example.invalid',source:'booking',date:'2026-12-02',time,practitionerId:'doctor-a'}});
function loadApi(config:Record<string,string>={}) {
 const authMock={setCustomUserClaims:async(uid:string,c:any)=>claims.push({uid,...c})};
 class Stripe {
  webhooks={constructEvent:(raw:any,sig:string)=>{if(sig!=='valid')throw Error('invalid');return raw;}};
  paymentIntents={create:async(p:any)=>{intents.push(p);return {id:'pi-test',client_secret:'synthetic',...p};},retrieve:async()=>({})};
 }
 class HttpsError extends Error {code:string;constructor(code:string,message:string){super(message);this.code=code;}}
 const f={config:()=>({}),logger:{info:()=>{},warn:()=>{},error:()=>{}},https:{onCall:(fn:any)=>fn,onRequest:(fn:any)=>fn,HttpsError},auth:{user:()=>({onCreate:(fn:any)=>fn})},pubsub:{schedule:()=>({onRun:(fn:any)=>fn})}};
 const exports:any={};
 const context={exports,require:(id:string)=>id==='firebase-admin/app'?{initializeApp:()=>{}}:id==='firebase-admin/firestore'?{getFirestore:()=>db,FieldValue:adminDb.FieldValue}:id==='firebase-admin/auth'?{getAuth:()=>authMock}:id==='firebase-functions/v1'?f:id==='stripe'?{default:Stripe}:id==='resend'?{Resend:class{}}:id==='./booking'?{bookingHandlers}:require(id),process:{env:config},console,Buffer,URLSearchParams,Intl,setTimeout};
 vm.runInNewContext(readFileSync(new URL('../functions/lib/index.js',import.meta.url),'utf8'),context);
 return exports;
}
beforeAll(()=>{
 app=adminApp.initializeApp({projectId:'demo-server-regression'},'regression');db=adminDb.getFirestore(app);
 const transaction=db.runTransaction.bind(db);db.runTransaction=(cb:any)=>transaction(async(tx:any)=>await cb(tx));
 handlers=bookingHandlers(db);
});
beforeEach(async()=>{
 await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-server-regression/databases/(default)/documents',{method:'DELETE'});
 await db.doc('clinics/clinic-a').set(clinic);claims=[];intents=[];api=loadApi({STRIPE_SECRET_KEY:'synthetic',STRIPE_PUBLISHABLE_KEY:'pk_synthetic',STRIPE_WEBHOOK_SECRET:'synthetic'});
});
afterAll(async()=>adminApp.deleteApp(app));
it('requires identity and never accepts client payment state or amount',async()=>{
 await expect(handlers.mutate(booking(),{})).rejects.toThrow();
 const r:any=await handlers.mutate({...booking(),patch:{...booking().patch,amountPaid:999,paymentStatus:'paid_full',priceMinor:1}},patient);
 expect(r.appointment.amountPaid).toBe(0);expect(r.appointment.paymentStatus).toBe('unpaid');expect(r.appointment.priceMinor).toBe(4900);expect(r.appointment.patientId).toBe('patient-a');
});
it('serializes competing reservations and checks interval overlaps',async()=>{
 const result=await Promise.allSettled([handlers.mutate(booking('A'),patient),handlers.mutate(booking('B','10:30 AM'),patient)]);
 expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(1);
});
it('rescheduling frees old time; cancellation persists and releases reservation',async()=>{
 await handlers.mutate(booking(),patient);
 await handlers.mutate({id:'A',clinicId:'clinic-a',patch:{time:'11:00 AM'}},patient);
 await handlers.mutate(booking('B'),patient);
 await handlers.mutate({id:'A',clinicId:'clinic-a',patch:{status:'cancelled'}},patient);
 await handlers.mutate(booking('C','11:00 AM'),patient);
 expect((await db.doc('appointments/A').get()).data().status).toBe('cancelled');
});
it('rejects other patients and tenants and unknown clinicians',async()=>{
 await handlers.mutate(booking(),patient);
 await expect(handlers.mutate({id:'A',clinicId:'clinic-a',patch:{notes:'steal'}},{auth:{uid:'other',token:{}}} as any)).rejects.toThrow();
 await expect(handlers.mutate({...booking('B'),patch:{...booking('B').patch,practitionerId:'unknown'}},patient)).rejects.toThrow();
});
it('retains waitlist service details and rejects unsigned intake',async()=>{
 const r:any=await handlers.mutate({id:'W',clinicId:'clinic-a',patch:{name:'Wait',phone:'555',status:'waitlist',preferredTimeWindow:'Afternoon'}},staff);
 expect(r.appointment.preferredTimeWindow).toBe('Afternoon');
 await expect(handlers.mutate({id:'W',clinicId:'clinic-a',patch:{intakeForm:{informedConsentAgreed:true}}},staff)).rejects.toThrow();
});
it('admin setup fails closed and commits failed-attempt accounting',async()=>{
 await expect(api.claimInitialClinicAdmin({clinicId:'clinic-a',setupToken:'anystring'},patient)).rejects.toThrow('Configure');
 api=loadApi({CLINIC_SETUP_TOKEN:'synthetic-correct-token'});
 for(let i=0;i<5;i++)await expect(api.claimInitialClinicAdmin({clinicId:'clinic-a',setupToken:'incorrect'},patient)).rejects.toThrow('Invalid');
 await expect(api.claimInitialClinicAdmin({clinicId:'clinic-a',setupToken:'incorrect'},patient)).rejects.toThrow('Too many');
 expect((await db.doc('clinic_config_private/claim_rate_limit').get()).data().failedAttempts).toBe(5);expect(claims).toHaveLength(0);
});
it('prevents moving another user into a different tenant role',async()=>{
 await db.doc('users/target').set({role:'patient',clinicId:'clinic-a'});
 await expect(api.setClinicUserRole({targetUid:'target',role:'admin',clinicId:'clinic-b'},staff)).rejects.toThrow();expect(claims).toHaveLength(0);
});
it('rejects unsigned webhook without touching appointments',async()=>{
 let status=0;const response={status:(s:number)=>{status=s;return response;},send:()=>{},json:()=>{}};
 await api.stripeWebhook({method:'POST',headers:{},body:{type:'payment_intent.succeeded'}},response);expect(status).toBe(400);
});
it('derives price server-side and locks one payment choice',async()=>{
 await handlers.mutate(booking(),patient);
 await expect(api.createPaymentIntent({appointmentId:'A',amount:0.01,paymentChoice:'full'},{})).rejects.toThrow();
 const r=await api.createPaymentIntent({appointmentId:'A',amount:0.01,paymentChoice:'full'},patient);
 expect(r.amount).toBe(4900);expect(intents[0].amount).toBe(4900);
 await expect(api.createPaymentIntent({appointmentId:'A',paymentChoice:'deposit'},patient)).rejects.toThrow('already initialized');
});
it('denies unauthenticated notifications before accessing providers',async()=>{
 await expect(api.sendAutomatedNotification({recipient:'test@example.invalid',messageText:'test',channel:'email'},{})).rejects.toThrow();
});

it('reconciles only matching signed settlement and ignores duplicate or stale success after refund',async()=>{
 await handlers.mutate(booking(),patient);
 await api.createPaymentIntent({appointmentId:'A',paymentChoice:'full'},patient);
 const intent={id:'pi-test',metadata:{appointmentId:'A',clinicId:'clinic-a'},amount_received:4900,currency:'usd',status:'succeeded'};
 const deliver=async(object:any,type='payment_intent.succeeded')=>{let status=200;const response={status:(s:number)=>{status=s;return response;},send:()=>{},json:()=>{}};await api.stripeWebhook({method:'POST',headers:{'stripe-signature':'valid'},rawBody:{type,data:{object}}},response);return status;};
 expect(await deliver({...intent,amount_received:1})).toBe(500);
 expect((await db.doc('appointments/A').get()).data().amountPaid).toBe(0);
 expect(await deliver(intent)).toBe(200);expect(await deliver(intent)).toBe(200);
 expect((await db.doc('appointments/A').get()).data().amountPaid).toBe(49);
 await deliver({payment_intent:'pi-test',refunded:true,amount:4900,amount_refunded:4900,currency:'usd'},'charge.refunded');
 await deliver(intent);
 expect((await db.doc('appointments/A').get()).data().paymentStatus).toBe('refunded');
 expect((await db.doc('appointments/A').get()).data().amountPaid).toBe(0);
});
it('allows cancellation after a clinician is removed and rejects impossible dates',async()=>{
 await handlers.mutate(booking(),patient);
 await db.doc('clinics/clinic-a').update({publicTeamMembers:[]});
 await handlers.mutate({id:'A',clinicId:'clinic-a',patch:{status:'cancelled'}},patient);
 expect((await db.doc('appointments/A').get()).data().status).toBe('cancelled');
 await db.doc('clinics/clinic-a').set(clinic);
 await expect(handlers.mutate({...booking('B'),patch:{...booking().patch,date:'2026-02-31'}},patient)).rejects.toThrow('valid date');
});
it('cash payment cannot race an initialized card payment',async()=>{
 await handlers.mutate(booking(),patient);
 const results=await Promise.allSettled([api.recordCashPayment({appointmentId:'A'},staff),api.createPaymentIntent({appointmentId:'A',paymentChoice:'full'},patient)]);
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
});
