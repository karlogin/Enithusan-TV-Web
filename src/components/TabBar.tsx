import { NavLink } from 'react-router-dom';
import './tabbar.css';

const TABS = [
  {
    to: '/',
    end: true,
    label: 'Home',
    icon: <path d="M12 3.2 3 10.5V21h6v-6.5h6V21h6V10.5L12 3.2Z" />,
  },
  {
    to: '/browse',
    end: false,
    label: 'Browse',
    icon: <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />,
  },
  {
    to: '/search',
    end: false,
    label: 'Search',
    icon: <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />,
  },
  {
    to: '/history',
    end: false,
    label: 'History',
    icon: <path d="M13 3a9 9 0 1 0 .001 18.001A9 9 0 0 0 13 3zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm.5-11H12v6l5.25 3.15.75-1.23-4.5-2.67V8z" />,
  },
  {
    to: '/my-list',
    end: false,
    label: 'My List',
    icon: <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />,
  },
];

export default function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">{tab.icon}</svg>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
