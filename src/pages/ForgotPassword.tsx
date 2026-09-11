import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import Logo from '../components/Logo';
import './auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResetUrl(null);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message ?? 'If that email is registered, reset instructions were sent.');
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="auth-sub">Enter your email and we'll send a reset link.</p>
        <form onSubmit={submit} className="auth-form">
          <div className="auth-field">
            <input
              id="fp-email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label htmlFor="fp-email">Email</label>
          </div>
          {message && (
            <p className="auth-msg">
              {message}
              {resetUrl && (
                <>
                  {' '}
                  <Link to={resetUrl.replace(/^https?:\/\/[^/]+/, '')}>Use link →</Link>
                </>
              )}
            </p>
          )}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
