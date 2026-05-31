import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: 720, paddingBottom: '4rem' }}>
        <h1>About Einthusan TV</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Einthusan TV is an unofficial Netflix-style front-end for browsing and watching
          Tamil, Hindi, and Malayalam movies from Einthusan.tv. It is a personal project
          and is not affiliated with or endorsed by Einthusan.
        </p>
        <h2 style={{ marginTop: '2rem' }}>Disclaimer</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          All content belongs to Einthusan and respective rights holders. Users are
          responsible for complying with applicable laws and terms of service in their
          region. This app does not host video files — streams are served from Einthusan&apos;s
          CDN.
        </p>
        <h2 style={{ marginTop: '2rem' }}>Install as an app</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Add this site to your home screen on iOS or Android for a full-screen experience.
          See the project README for install instructions.
        </p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
