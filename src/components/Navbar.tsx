import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useClinic } from '../data/ClinicContext';

interface NavbarProps { onBookClick: () => void }

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const { clinicData: clinic, allLocations, activeLocation, setActiveLocationId, openPatientPortal } = useClinic();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const logo = clinic.logoUrl || clinic.logoImage || clinic.logo;
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => setLogoError(false), [logo]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open]);

  const links = [
    { href: '/', label: 'Home', enabled: true },
    { href: '/conditions', label: 'Care', enabled: clinic.showPageConditions !== false && clinic.showNavConditions !== false },
    { href: '/first-visit', label: 'First visit', enabled: clinic.showPageFirstVisit !== false && clinic.showNavFirstVisit !== false },
    { href: '/about', label: 'About', enabled: clinic.showPageAbout !== false && clinic.showNavAbout !== false },
    { href: '/team', label: 'People', enabled: clinic.showPageTeam !== false && clinic.showNavTeam !== false },
    { href: '/pricing', label: 'Fees', enabled: clinic.showPagePricing !== false && clinic.showNavPricing !== false },
    { href: '/blog', label: 'Journal', enabled: clinic.showPageBlog !== false && clinic.showNavBlog !== false },
    { href: '/contact', label: 'Contact', enabled: true },
  ].filter(link => link.enabled);

  return (
    <nav aria-label="Main navigation" className="pv2-nav">
      {allLocations?.length > 1 && (
        <div className="pv2-location-switch">
          <div className="pv2-wrap">
            <label htmlFor="pv2-active-clinic">Location</label>
            <select id="pv2-active-clinic" value={activeLocation?.id || allLocations[0]?.id}
              onChange={(event) => setActiveLocationId(event.target.value)}>
              {allLocations.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.city}</option>)}
            </select>
          </div>
        </div>
      )}
      <div className="pv2-wrap pv2-nav-inner">
        <Link to="/" className="pv2-brand" aria-label={(clinic.name || 'Clinic') + ' home'}>
          {logo && !logoError && <img src={logo} alt={clinic.logoUrlAlt || clinic.name || 'Practice logo'}
            style={{ maxWidth: clinic.logoWidth ? Math.min(Number(clinic.logoWidth), 180) + 'px' : '168px' }}
            onError={() => setLogoError(true)} />}
          {!clinic.hideLogoText && <span className="pv2-brand-name">
            <strong>{clinic.logoText || clinic.name || 'The practice'}</strong>
            <small>{clinic.cityState || clinic.city || 'Chiropractic care'}</small>
          </span>}
          {(!logo || logoError) && clinic.hideLogoText && <span className="pv2-brand-name"><strong>{clinic.name || 'The practice'}</strong></span>}
        </Link>

        <div className="pv2-nav-links" aria-label="Pages">
          {links.map(link => <Link key={link.href} to={link.href}
            aria-current={location.pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
        </div>
        <div className="pv2-nav-actions">
          {clinic.showPagePortal !== false && <button type="button" className="pv2-nav-portal" onClick={() => openPatientPortal()}>My booking</button>}
          <button type="button" className="pv2-nav-book" id="nav-book-now-button" onClick={onBookClick}>
            {clinic.navButtonText || 'Book a visit'} <span aria-hidden="true">↗</span>
          </button>
          <button type="button" className="pv2-menu-toggle" aria-expanded={open}
            aria-controls="pv2-mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(value => !value)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && <div className="pv2-mobile-nav" id="pv2-mobile-nav">
        <div className="pv2-wrap">
          {links.map(link => <Link key={link.href} to={link.href} onClick={() => setOpen(false)}
            aria-current={location.pathname === link.href ? 'page' : undefined}>{link.label}<span aria-hidden="true">↗</span></Link>)}
          {clinic.showPagePortal !== false && <button type="button" onClick={() => {setOpen(false);openPatientPortal();}}>Manage your booking ↗</button>}
        </div>
      </div>}
    </nav>
  );
};
