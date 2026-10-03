"use strict";
/**
 * Concurrency & Scheduling Utility Module
 * Handles timezone calculation, interval overlapping, and business rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeToMinutes = parseTimeToMinutes;
exports.formatMinutesToTime = formatMinutesToTime;
exports.intervalsOverlap = intervalsOverlap;
exports.getUtcInstantForTimezone = getUtcInstantForTimezone;
exports.generateBookingReference = generateBookingReference;
exports.validateOperatingHours = validateOperatingHours;
/**
 * Parses time string like "9:00 AM", "14:30", "1:15 PM" to minutes from midnight
 */
function parseTimeToMinutes(timeStr) {
    if (!timeStr)
        return 0;
    const clean = timeStr.trim().toUpperCase();
    const isPm = clean.includes('PM');
    const isAm = clean.includes('AM');
    const match = clean.match(/(\d{1,2}):(\d{2})/);
    if (!match)
        return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (isPm && hours < 12)
        hours += 12;
    if (isAm && hours === 12)
        hours = 0;
    return hours * 60 + minutes;
}
/**
 * Formats minutes from midnight to "h:mm A" (e.g. 600 -> "10:00 AM")
 */
function formatMinutesToTime(mins) {
    const norm = ((mins % 1440) + 1440) % 1440;
    let hours = Math.floor(norm / 60);
    const minutes = norm % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0)
        hours = 12;
    const minPad = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minPad} ${ampm}`;
}
/**
 * Checks if two intervals overlap: max(start1, start2) < min(end1, end2)
 */
function intervalsOverlap(start1, end1, start2, end2) {
    return Math.max(start1, start2) < Math.min(end1, end2);
}
/**
 * Converts a date (YYYY-MM-DD) and time string to UTC ISO instant using specified timezone
 * Supports DST transitions via Intl.DateTimeFormat
 */
function getUtcInstantForTimezone(dateStr, timeStr, timezone = 'Europe/London') {
    const mins = parseTimeToMinutes(timeStr);
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    // Form rough UTC timestamp
    const dateObj = new Date(Date.UTC(year, month, day, hours, minutes, 0));
    // Determine timezone offset in target timezone at this time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
    });
    // Calculate difference between date in timezone and target UTC
    const parts = formatter.formatToParts(dateObj);
    const tzYear = parseInt(parts.find((p) => p.type === 'year')?.value || `${year}`, 10);
    const tzMonth = parseInt(parts.find((p) => p.type === 'month')?.value || `${month + 1}`, 10) - 1;
    const tzDay = parseInt(parts.find((p) => p.type === 'day')?.value || `${day}`, 10);
    let tzHour = parseInt(parts.find((p) => p.type === 'hour')?.value || `${hours}`, 10);
    if (tzHour === 24)
        tzHour = 0;
    const tzMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || `${minutes}`, 10);
    const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0));
    const offsetMs = tzDate.getTime() - dateObj.getTime();
    // Adjust dateObj so that its time in `timezone` equals the desired hours and minutes
    const targetUtcMs = dateObj.getTime() - offsetMs;
    return new Date(targetUtcMs).toISOString();
}
/**
 * Generates human-friendly booking reference (e.g. COL-8F32-K92P)
 */
function generateBookingReference(prefix = 'COL') {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
        p1 += chars.charAt(Math.floor(Math.random() * chars.length));
        p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${p1}-${p2}`;
}
function validateOperatingHours(startMinutes, endMinutes, dayHours) {
    if (dayHours.closed) {
        return { valid: false, reason: 'Clinic is closed on this day of the week.' };
    }
    const openMins = parseTimeToMinutes(dayHours.open || '09:00');
    const closeMins = parseTimeToMinutes(dayHours.close || '17:00');
    if (startMinutes < openMins || endMinutes > closeMins) {
        return {
            valid: false,
            reason: `Appointment time (${formatMinutesToTime(startMinutes)} - ${formatMinutesToTime(endMinutes)}) falls outside clinic hours (${formatMinutesToTime(openMins)} - ${formatMinutesToTime(closeMins)}).`,
        };
    }
    if (dayHours.lunchBreakEnabled && dayHours.lunchStart && dayHours.lunchEnd) {
        const lunchStartMins = parseTimeToMinutes(dayHours.lunchStart);
        const lunchEndMins = parseTimeToMinutes(dayHours.lunchEnd);
        if (intervalsOverlap(startMinutes, endMinutes, lunchStartMins, lunchEndMins)) {
            return {
                valid: false,
                reason: `Appointment overlaps with clinic lunch break (${dayHours.lunchStart} - ${dayHours.lunchEnd}).`,
            };
        }
    }
    return { valid: true };
}
//# sourceMappingURL=scheduleUtils.js.map