import { defaultClinic, defaultSchedulingRules } from './clinicData';
import { defaultPublicTeamMembers } from './defaultTeamData';
import { agencyDemoPresets } from './presets';
import overrides from './siteOverrides.json';
import type { ClinicInfo } from '../types';
const preset = agencyDemoPresets[(import.meta.env.VITE_DEFAULT_PRESET || '').toLowerCase()] || {};
export const initialClinic: ClinicInfo = {
  ...defaultClinic, publicTeamMembers: defaultPublicTeamMembers, schedulingRules: defaultSchedulingRules,
  examFee:'$49', followUpFee:'$35',timeZone:'America/New_York', ...preset, ...overrides,
};
