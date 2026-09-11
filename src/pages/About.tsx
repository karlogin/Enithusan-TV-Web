import { Link } from 'react-router-dom';
import '../App.css';

export default function About() {
  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 720, paddingBottom: '5rem' }}>
        <div className="page-header">
          <h1>About Vada</h1>
          <p className="page-subtitle">A premium front-end for South Asian cinema.</p>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1rem' }}>
            Vada is a beautifully crafted streaming interface for Tamil, Hindi, and Malayalam
            movies. It brings a cinematic, Apple-native experience to a catalogue of South Asian
            cinema — discover, browse, and watch in one fluid app.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>How it works</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            Vada is a front-end interface. It does not host or store any video files — streams
            are served directly from the content CDN. Users are responsible for complying with
            applicable laws and terms of service in their region.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Install as an app</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            Add Vada to your home screen for a full-screen, native-feeling experience.
            On iOS and iPadOS: tap the Share button in Safari, then choose
            &ldquo;Add to Home Screen.&rdquo; On Android: tap the browser menu and choose
            &ldquo;Install app&rdquo; or &ldquo;Add to home screen.&rdquo;
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Privacy</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            Vada stores your watchlist, continue-watching progress, and profile preferences
            locally on your device and, when signed in, on our servers. No viewing data is sold
            or shared with third parties.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Keyboard shortcuts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {[
              ['Space / K', 'Play / Pause'],
              ['← / J', 'Rewind 10s'],
              ['→ / L', 'Forward 10s'],
              ['M', 'Toggle mute'],
              ['F', 'Toggle fullscreen'],
              ['↑ / ↓', 'Volume up / down'],
              ['/', 'Focus search'],
            ].map(([key, desc]) => (
              <>
                <kbd key={key} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '0.2rem 0.5rem', fontFamily: 'inherit', fontSize: '0.82rem', whiteSpace: 'nowrap', alignSelf: 'start' }}>
                  {key}
                </kbd>
                <span key={desc}>{desc}</span>
              </>
            ))}
          </div>
        </section>

        <Link to="/" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
