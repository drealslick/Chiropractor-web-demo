import {describe,it,expect} from 'vitest';
import {paidAmount,paidLabel,appointmentCalendar,appointmentInstant} from '../src/utils/patientDocuments';
const lead:any={id:'TEST-1',name:'Test',source:'booking',email:'test@example.invalid',phone:'',createdAt:'2026-10-01',date:'2026-10-02',time:'10:00 AM',durationMinutes:45,paymentStatus:'unpaid',status:'confirmed'};
describe('Patient documents',()=>{
 it('never labels an unpaid or refunded booking paid even with stale amounts',()=>{
  expect(paidAmount({...lead,amountPaid:49,paymentAmount:'£49'})).toBe(0);
  expect(paidAmount({...lead,paymentStatus:'refunded',amountPaid:49})).toBe(0);
  expect(paidLabel(lead,'$')).toBe('$0.00');
 });
 it('uses only verified numeric settlement',()=>{
  expect(paidAmount({...lead,paymentStatus:'paid_full',paymentAmount:'$49'})).toBe(0);
  expect(paidLabel({...lead,paymentStatus:'deposit_paid',amountPaid:25,currency:'usd'})).toBe('$25.00');
 });
 it('exports real appointment time and duration in clinic timezone',()=>{
  const ics=appointmentCalendar(lead,{name:'Clinic',timeZone:'America/New_York'});
  expect(ics).toContain('DTSTART:20261002T140000Z');expect(ics).toContain('DTEND:20261002T144500Z');
 });
 it('handles winter offsets and rejects missing spring-forward times',()=>{
  expect(appointmentInstant('2026-12-02','10:00 AM','America/New_York').toISOString()).toBe('2026-12-02T15:00:00.000Z');
  expect(()=>appointmentInstant('2026-03-08','2:30 AM','America/New_York')).toThrow();
 });
 it('escapes calendar text to prevent injected fields',()=>{
  const ics=appointmentCalendar({...lead,serviceTitle:'Test\nATTENDEE:bad'},{name:'Clinic, Inc.'});
  expect(ics).toContain('Test\\nATTENDEE:bad');expect(ics).not.toContain('\r\nATTENDEE:bad');
 });
});
