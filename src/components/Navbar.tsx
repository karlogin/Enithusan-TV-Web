import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import CustomSelect from './CustomSelect';
import Logo from './Logo';
import ProfileSwitcher from './ProfileSwitcher';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpotlight } from '../context/SpotlightContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { LANGUAGES } from '../types';
import './navbar.css';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { user, logout, loading } = useAuth();
  const { openSpotlight } = useSpotlight();
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useKeyboardShortcuts(openSpotlight);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <Logo />
        {/* Mobile-only language switcher */}
        <div className="mobile-lang-pills">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`mobile-lang-pill ${language === value ? 'active' : ''}`}
              onClick={() => setLanguage(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="navbar-links">
          <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink></li>
          <li><NavLink to="/browse" className={({ isActive }) => (isActive ? 'active' : '')}>Browse</NavLink></li>
          <li><NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>History</NavLink></li>
          <li><NavLink to="/my-list" className={({ isActive }) => (isActive ? 'active' : '')}>My List</NavLink></li>
        </ul>
      </div>

      <div className="navbar-right">
        <ProfileSwitcher />

        <button
          type="button"
          className="search-toggle"
          aria-label="Search"
          onClick={openSpotlight}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>

        {!loading && (
          <div className="profile-menu profile-menu-desktop" ref={menuRef}>
            <button
              type="button"
              className="profile-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Account and settings"
            >
              {user ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5Z" /></svg>
              )}
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                {user && (
                  <>
                    <p className="profile-name">{user.name}</p>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-dropdown-sep" />
                  </>
                )}

                <div className="profile-dropdown-row">
                  <CustomSelect
                    value={language}
                    onChange={(v) => setLanguage(v as typeof language)}
                    options={LANGUAGES}
                    ariaLabel="Language filter"
                  />
                </div>

                <div className="profile-dropdown-sep" />

                {user ? (
                  <>
                    <Link to="/my-list" onClick={() => setMenuOpen(false)}>My List</Link>
                    <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                    <button type="button" onClick={async () => { await logout(); setMenuOpen(false); }}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="profile-dropdown-signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
