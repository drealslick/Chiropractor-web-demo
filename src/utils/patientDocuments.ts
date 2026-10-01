import type { PatientLead } from '../data/leadsStore';

export function paidAmount(lead: PatientLead): number {
  if (!['paid_full', 'deposit_paid'].includes(lead.paymentStatus || '')) return 0;
  return typeof lead.amountPaid === 'number' && Number.isFinite(lead.amountPaid) ? Math.max(0, lead.amountPaid) : 0;
}
export function paidLabel(lead: PatientLead, symbol = '$') {
  const currency = lead.currency || (symbol === '£' ? 'GBP' : symbol === '€' ? 'EUR' : 'USD');
  return new Intl.NumberFormat('en-US', {style:'currency',currency}).format(paidAmount(lead));
}
export function appointmentInstant(date: string, time: string, timeZone: string): Date {
  const match = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !match) throw new Error('Appointment date and time are required.');
  let hour = +match[1];
  if (+match[2] > 59 || hour > (match[3] ? 12 : 23)) throw new Error('Invalid appointment time.');
  if (match[3]) hour = hour % 12 + (match[3].toUpperCase()==='PM'?12:0);
  const target = Date.parse(`${date}T${String(hour).padStart(2,'0')}:${match[2]}:00Z`);
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  const localEpoch = (utc:number) => { const p=Object.fromEntries(formatter.formatToParts(utc).map(v=>[v.type,v.value]));return Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`); };
  let utc=target;
  for(let i=0;i<4;i++) utc+=target-localEpoch(utc);
  if(localEpoch(utc)!==target) throw new Error('This time does not exist in the clinic timezone.');
  return new Date(utc);
}
const escapeIcs = (value: string) => value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
export function appointmentCalendar(lead: PatientLead, clinic: {name?:string;address?:string;timeZone?:string}) {
  const start = appointmentInstant(lead.date || '',lead.time || '',lead.timeZone || clinic.timeZone || 'America/New_York');
  const stamp = (d:Date) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const end=new Date(start.getTime()+(lead.durationMinutes || 45)*60000);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Practice Portal//Appointments//EN','BEGIN:VEVENT',`UID:${escapeIcs(lead.id)}@practice`,
    `DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${escapeIcs(`Appointment - ${clinic.name}`)}`,
    `DESCRIPTION:${escapeIcs(lead.serviceTitle || lead.condition || 'Consultation')}`,`LOCATION:${escapeIcs(lead.locationAddress || clinic.address || '')}`,
    `STATUS:${lead.status==='cancelled'?'CANCELLED':'CONFIRMED'}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
