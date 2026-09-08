import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ProfileSwitcher from './ProfileSwitcher';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { LANGUAGES } from '../types';
import './navbar.css';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useKeyboardShortcuts(() => {
    setSearchOpen(true);
    searchRef.current?.focus();
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark');
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <Logo />
        <ul className="navbar-links">
          <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink></li>
          <li><NavLink to="/browse" className={({ isActive }) => (isActive ? 'active' : '')}>Browse</NavLink></li>
          <li><NavLink to="/my-list" className={({ isActive }) => (isActive ? 'active' : '')}>My List</NavLink></li>
        </ul>
      </div>

      <div className="navbar-right">
        <ProfileSwitcher />
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          aria-label="Language filter"
        >
          {LANGUAGES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <button type="button" className="theme-toggle" onClick={cycleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : theme === 'light' ? '🌙' : '◐'}
        </button>

        <form className="search-form" onSubmit={submitSearch}>
          <div className={`search-input-wrap ${searchOpen ? 'open' : ''}`}>
            <input
              ref={searchRef}
              className="search-input"
              type="search"
              placeholder="Titles, people, genres ( / )"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search movies"
            />
          </div>
          <button
            type="button"
            className="search-toggle"
            aria-label="Search"
            onClick={() => {
              if (searchOpen && query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              } else {
                setSearchOpen((v) => !v);
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </form>

        {!loading && (
          <div className="navbar-auth">
            {user ? (
              <div className="profile-menu">
                <button type="button" className="profile-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="profile-dropdown">
                    <p className="profile-name">{user.name}</p>
                    <p className="profile-email">{user.email}</p>
                    <Link to="/my-list" onClick={() => setMenuOpen(false)}>My List</Link>
                    <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                    <button type="button" onClick={async () => { await logout(); setMenuOpen(false); }}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-signin">Sign In</Link>
            )}
          </div>
        )}

        <button
          type="button"
          className="navbar-burger"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4Z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" /></svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/browse" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Browse</NavLink>
          <NavLink to="/my-list" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>My List</NavLink>

          <div className="navbar-mobile-row">
            <select
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              aria-label="Language filter"
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button type="button" className="theme-toggle" onClick={cycleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀ Light' : theme === 'light' ? '🌙 System' : '◐ Dark'}
            </button>
          </div>

          {!loading && (
            user ? (
              <>
                <NavLink to="/account" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Account</NavLink>
                <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>About</NavLink>
                <button type="button" className="navbar-mobile-signout" onClick={async () => { await logout(); setMobileMenuOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="nav-signin navbar-mobile-signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
