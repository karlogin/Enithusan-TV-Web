import { useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../api';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import { exportLibrary } from '../utils/libraryExport';
import './auth.css';

export default function Account() {
  const { user, logout } = useAuth();
  const { profiles, addProfile, removeProfile } = useProfile();
  const { myList, continueWatching, importLibrary } = useUserLibrary();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState('');

  if (!user) {
    return (
      <div className="page">
        <div className="page-content error-screen">
          <p>Sign in to manage your account.</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await changePassword(current, next);
      setMsg('Password updated successfully.');
      setCurrent('');
      setNext('');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to update password.');
    }
  };

  const onExport = () => {
    exportLibrary({ myList, continueWatching, exportedAt: Date.now() });
  };

  const onImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text()) as unknown;
        if (
          typeof data !== 'object' ||
          data === null ||
          !Array.isArray((data as Record<string, unknown>).myList) ||
          !Array.isArray((data as Record<string, unknown>).continueWatching)
        ) {
          setMsg('Invalid library file.');
          return;
        }
        const { myList: importedList, continueWatching: importedCW } = data as {
          myList: typeof myList;
          continueWatching: typeof continueWatching;
        };
        importLibrary({ myList: importedList, continueWatching: importedCW });
        setMsg('Library imported successfully.');
      } catch {
        setMsg('Invalid library file.');
      }
    };
    input.click();
  };

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 560, paddingBottom: '5rem' }}>
        <div className="page-header">
          <h1>Account</h1>
          <p className="page-subtitle">{user.name} · {user.email}</p>
        </div>

        <section className="account-section">
          <h2>Change Password</h2>
          <form onSubmit={onChangePassword} className="auth-form">
            <div className="auth-field">
              <input
                id="acc-current"
                type="password"
                placeholder=" "
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label htmlFor="acc-current">Current password</label>
            </div>
            <div className="auth-field">
              <input
                id="acc-next"
                type="password"
                placeholder=" "
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <label htmlFor="acc-next">New password</label>
            </div>
            {msg && <p className="auth-msg">{msg}</p>}
            <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              Update Password
            </button>
          </form>
        </section>

        <section className="account-section">
          <h2>Profiles</h2>
          {profiles.map((p) => (
            <div key={p.id} className="account-row">
              <span className="account-row-name">
                {p.name}{p.isKids ? ' · Kids' : ''}
              </span>
              {p.id !== 'default' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                  onClick={() => removeProfile(p.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="account-add-row">
            <input
              value={newProfile}
              onChange={(e) => setNewProfile(e.target.value)}
              placeholder="New profile name"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { if (newProfile.trim()) { addProfile(newProfile.trim()); setNewProfile(''); } }}
            >
              Add
            </button>
          </div>
        </section>

        <section className="account-section">
          <h2>Library Backup</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
            Export your watchlist and progress as a JSON file, or import a previous backup.
          </p>
          <div className="account-actions">
            <button type="button" className="btn btn-secondary" onClick={onExport}>Export JSON</button>
            <button type="button" className="btn btn-secondary" onClick={onImport}>Import JSON</button>
          </div>
        </section>

        <section className="account-section" style={{ borderBottom: 'none' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ color: '#ff6b6b', borderColor: 'rgba(255,80,80,0.18)' }}
            onClick={() => logout()}
          >
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}
