import React, { createContext, useState, ReactNode } from 'react';
import { ClinicInfo } from '../types';
import { defaultClinic } from '../data/clinicData'; 

// 1. Define the shape of our context
interface ClinicContextType {
  clinicData: ClinicInfo;
  setClinicData: React.Dispatch<React.SetStateAction<ClinicInfo>>;
}

// 2. Create the Context
export const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// 3. Create the Provider component that will wrap our app
export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // We initialize the state with your default clinic data
  const [clinicData, setClinicData] = useState<ClinicInfo>(defaultClinic);

  return (
    <ClinicContext.Provider value={{ clinicData, setClinicData }}>
      {children}
    </ClinicContext.Provider>
  );
};
