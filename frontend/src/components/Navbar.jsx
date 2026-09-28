import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [motionOff, setMotionOff] = useState(false);
  const toggleRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1100px)');
    const closeDesktop = () => { if (!query.matches) setOpen(false); };
    query.addEventListener('change', closeDesktop);
    return () => query.removeEventListener('change', closeDesktop);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motionOff ? 'off' : 'on';
    return () => { delete document.documentElement.dataset.motion; };
  }, [motionOff]);
  useEffect(() => {
    if (!open) return;
    const escape = event => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  const links = [
    ['/', 'Home'], ['/predict', 'Symptoms'], ['/diabetes', 'Diabetes'],
    ['/aboutus', 'About'], ['/contact', 'Contact'],
    ...(isAuthenticated ? [['/previous-predictions', 'History']] : []),
  ];
  return (
    <header className="nova-header">
      <a href="#nova-content" className="nova-skip">Skip navigation</a>
      <nav className="nova-nav" aria-label="Main navigation">
        <Link to="/" className="nova-brand" aria-label="PREDET-AI home">
          <span className="nova-brand-icon" aria-hidden="true">+</span>
          <span>PREDET<span className="nova-brand-accent">-AI</span></span>
        </Link>
        <button ref={toggleRef} type="button" className="nova-toggle" aria-expanded={open} aria-controls="nova-links" onClick={() => setOpen(value => !value)}>{open ? 'Close menu ×' : 'Menu ☰'}</button>
        <div className={`nova-links ${open ? 'is-open' : ''}`} id="nova-links">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nova-link${isActive ? ' is-active' : ''}`}>{label}</NavLink>)}
          <div className="nova-account">
            {isAuthenticated ? <><span className="nova-greeting">Hi, {user?.name || 'there'}</span><button className="nova-signin" type="button" onClick={() => { logout(); navigate('/login'); }}>Sign out</button></> : <><Link to="/login" className="nova-link">Sign in</Link><Link to="/signup" className="nova-signin">Get started ↗</Link></>}
          </div>
        </div>
      </nav>
      <div id="nova-content" tabIndex={-1} className="nova-content-anchor" />
    </header>
  );
}
