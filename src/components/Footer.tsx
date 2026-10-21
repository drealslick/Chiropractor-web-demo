import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import type { ClinicInfo } from '../types';

interface FooterProps {
  clinic: ClinicInfo;
  onOpenManager?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ clinic, onOpenManager }) => {
  const { openPatientPortal } = useClinic();
  const address = [clinic.address, clinic.cityState || clinic.city, clinic.zip].filter(Boolean).join(', ');
  const pages = [
    { to: '/conditions', title: 'Areas of care', show: clinic.showPageConditions !== false },
    { to: '/first-visit', title: 'Your first visit', show: clinic.showPageFirstVisit !== false },
    { to: '/team', title: 'Our people', show: clinic.showPageTeam !== false },
    { to: '/about', title: 'About the practice', show: clinic.showPageAbout !== false },
    { to: '/pricing', title: 'Fees', show: clinic.showPagePricing !== false },
    { to: '/blog', title: 'Journal', show: clinic.showPageBlog !== false },
    { to: '/contact', title: 'Get in touch', show: true },
  ];
  return (
    <footer className="pv2-footer">
      <div className="pv2-wrap">
        <div className="pv2-footer-top">
          <div className="pv2-footer-brand">
            <Link to="/" className="pv2-footer-title">{clinic.logoText || clinic.name || 'The practice'}</Link>
            <p>{clinic.footerDescription || 'A place to talk through your concerns and explore what might help.'}</p>
          </div>
          <div className="pv2-footer-links">
            <span className="pv2-kicker">Explore</span>
            <nav aria-label="Footer navigation">
              {pages.filter(item => item.show).map(item => <Link key={item.to} to={item.to}>{item.title}</Link>)}
            </nav>
          </div>
          <div className="pv2-footer-contact">
            <span className="pv2-kicker">Find us</span>
            {address && <p>{address}</p>}
            {clinic.phone && <a href={'tel:' + (clinic.phoneRaw || clinic.phone)}>{clinic.phone}</a>}
            {clinic.email && <a href={'mailto:' + clinic.email}>{clinic.email}</a>}
            {clinic.hoursWeekday && <p>{clinic.hoursWeekday}</p>}
            {clinic.showPagePortal !== false && <button type="button" onClick={() => openPatientPortal()}>Manage a booking ↗</button>}
          </div>
        </div>
        <div className="pv2-footer-bottom">
          <span>© {new Date().getFullYear()} {clinic.name || 'The practice'}</span>
          <div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
            {onOpenManager && <button type="button" onClick={onOpenManager}>Site manager</button>}
          </div>
        </div>
      </div>
    </footer>
  );
};
