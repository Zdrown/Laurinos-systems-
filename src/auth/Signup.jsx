import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) setError(error.message);
    else setSuccess('Account created. You may now sign in.');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="restaurant-name">Laurino's Tavern</div>
          <div className="doc-label">System Architecture</div>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className="auth-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="auth-btn">Create Account</button>
        </form>
        <div className="auth-footer">
          <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
