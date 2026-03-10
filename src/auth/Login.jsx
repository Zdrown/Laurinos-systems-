import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="restaurant-name">Laurino's Tavern</div>
          <div className="doc-label">System Architecture</div>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>
          <button type="submit" className="auth-btn">Sign In</button>
        </form>
        <div className="auth-footer">
          <Link to="/signup" className="auth-link">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
}
