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
    try {
      await changePassword(current, next);
      setMsg('Password updated.');
      setCurrent('');
      setNext('');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
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
        const data = JSON.parse(await file.text()) as { myList: unknown[]; continueWatching: unknown[] };
        importLibrary({
          myList: data.myList as typeof myList,
          continueWatching: data.continueWatching as typeof continueWatching,
        });
        setMsg('Library imported.');
      } catch {
        setMsg('Invalid library file.');
      }
    };
    input.click();
  };

  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 520, paddingBottom: '4rem' }}>
        <div className="page-header">
          <h1>Account</h1>
          <p className="page-subtitle">{user.email}</p>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Change password</h2>
          <form onSubmit={onChangePassword} className="auth-form">
            <label>Current<input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required /></label>
            <label>New<input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} /></label>
            {msg && <p className="auth-sub">{msg}</p>}
            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Profiles</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0' }}>
            {profiles.map((p) => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>{p.name}{p.isKids ? ' (Kids)' : ''}</span>
                {p.id !== 'default' && (
                  <button type="button" onClick={() => removeProfile(p.id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={newProfile} onChange={(e) => setNewProfile(e.target.value)} placeholder="New profile name" />
            <button type="button" className="btn btn-secondary" onClick={() => { if (newProfile.trim()) { addProfile(newProfile.trim()); setNewProfile(''); } }}>
              Add
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>My List backup</h2>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onExport}>Export JSON</button>
            <button type="button" className="btn btn-secondary" onClick={onImport}>Import JSON</button>
          </div>
        </section>

        <button type="button" className="btn btn-secondary" onClick={() => logout()}>Sign Out</button>
      </div>
    </div>
  );
}
