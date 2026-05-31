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
      </div>
    </header>
  );
}
