import { useEffect } from 'react';
import { useClinic } from './ClinicContext';

export function usePageMeta(pageTitle: string, pageDesc?: string) {
  const { clinicData: clinic } = useClinic();

  useEffect(() => {
    document.title = `${pageTitle} | ${clinic.name}`;

    const desc = pageDesc || clinic.tagline || clinic.name;
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'description');
      document.head.appendChild(el);
    }
    el.setAttribute('content', desc);
  }, [pageTitle, pageDesc, clinic.name, clinic.tagline]);
}