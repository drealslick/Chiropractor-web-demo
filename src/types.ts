import { ColorPaletteId } from './data/colorPalettes';

export interface ClinicInfo {
  id?: string;
  name?: string;
  doctorName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;
  services?: string[];
  hours?: Record<string, string>;
  selectedPaletteId?: ColorPaletteId;
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
}

export interface ClientData {
  id: string;
  clinicName: string;
  doctorName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  paletteId: ColorPaletteId;
  info: ClinicInfo;
}
