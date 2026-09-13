import { useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../api';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import { exportLibrary } from '../utils/libraryExport';
import './auth.css';

function PinSetup({ profileId, hasPin, onSet }: { profileId: string; hasPin: boolean; onSet: (pin: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits'); return; }
    onSet(pin);
    setEditing(false);
    setPin('');
    setError('');
  };

  if (!editing) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}
        onClick={() => setEditing(true)}
      >
        {hasPin ? 'Change PIN' : 'Set PIN'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        placeholder="4-digit PIN"
        value={pin}
        autoFocus
        onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
        style={{ width: 100, padding: '0.35rem 0.5rem', borderRadius: 8, border: '1px solid var(--glass-border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '1rem' }}
        aria-label={`PIN for profile ${profileId}`}
      />
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="button" className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }} onClick={submit}>Save</button>
        {hasPin && <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem', color: '#ff6b6b' }} onClick={() => { onSet(null); setEditing(false); setPin(''); }}>Remove PIN</button>}
        <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }} onClick={() => { setEditing(false); setPin(''); setError(''); }}>Cancel</button>
      </div>
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const { profiles, addProfile, removeProfile, setProfilePin } = useProfile();
  const { myList, continueWatching, importLibrary } = useUserLibrary();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState('');
  const [newProfileKids, setNewProfileKids] = useState(false);

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
            <div key={p.id} className="account-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <div className="profile-avatar-sm" style={{ background: p.color }}>{p.name[0].toUpperCase()}</div>
                <span className="account-row-name">
                  {p.name}
                  {p.isKids && <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', padding: '1px 6px', borderRadius: 99, background: 'rgba(70,211,105,0.15)', color: '#46d369' }}>Kids</span>}
                  {p.pin && <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', opacity: 0.6 }}>🔒</span>}
                </span>
                {p.id !== 'default' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.82rem', color: '#ff6b6b' }}
                    onClick={() => removeProfile(p.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <PinSetup profileId={p.id} hasPin={!!p.pin} onSet={(pin) => setProfilePin(p.id, pin)} />
            </div>
          ))}
          <div className="account-add-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              value={newProfile}
              onChange={(e) => setNewProfile(e.target.value)}
              placeholder="New profile name"
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newProfileKids}
                onChange={(e) => setNewProfileKids(e.target.checked)}
              />
              Kids profile (no access to adult content)
            </label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { if (newProfile.trim()) { addProfile(newProfile.trim(), newProfileKids); setNewProfile(''); setNewProfileKids(false); } }}
            >
              Add Profile
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
