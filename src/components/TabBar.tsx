import { NavLink, useLocation } from 'react-router-dom';
import { useSpotlight } from '../context/SpotlightContext';
import './tabbar.css';

export default function TabBar() {
  const { openSpotlight } = useSpotlight();
  const location = useLocation();
  const isSearch = location.pathname === '/search';

  return (
    <nav className="tab-bar" aria-label="Primary">
      {/* Home */}
      <NavLink to="/" end className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.2 3 10.5V21h6v-6.5h6V21h6V10.5L12 3.2Z" />
        </svg>
        <span>Home</span>
      </NavLink>

      {/* Search — opens spotlight overlay */}
      <button
        type="button"
        className={`tab-bar-item ${isSearch ? 'active' : ''}`}
        onClick={openSpotlight}
        aria-label="Search"
        aria-pressed={isSearch}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <span>Search</span>
      </button>

      {/* History */}
      <NavLink to="/history" className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 3a9 9 0 1 0 .001 18.001A9 9 0 0 0 13 3zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm.5-11H12v6l5.25 3.15.75-1.23-4.5-2.67V8z" />
        </svg>
        <span>History</span>
      </NavLink>

      {/* My List */}
      <NavLink to="/my-list" className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
        </svg>
        <span>My List</span>
      </NavLink>

      {/* Profile */}
      <NavLink to="/account" className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5Z" />
        </svg>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
