import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../types';
import './navbar.css';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

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

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          EINTHUSAN
        </Link>
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/browse" className={({ isActive }) => (isActive ? 'active' : '')}>
              Browse
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          aria-label="Language filter"
        >
          {LANGUAGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <form className="search-form" onSubmit={submitSearch}>
          <div className={`search-input-wrap ${searchOpen ? 'open' : ''}`}>
            <input
              className="search-input"
              type="search"
              placeholder="Titles, people, genres"
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
      </div>
    </header>
  );
}
