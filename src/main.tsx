import './utils/customEvents';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getGatewaySettings } from './data/gatewayStore';
import App from './App.tsx';
import './index.css';

// Retire legacy browser credentials and patient caches in live mode.
if (import.meta.env.VITE_DEMO_MODE !== 'true') {
  for (const key of ['agency_patient_accounts_v1','agency_patient_leads_v1','vance_gateway_logs_v1']) localStorage.removeItem(key);
}

getGatewaySettings(); // Also scrub any legacy provider secrets while preserving templates.

const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
