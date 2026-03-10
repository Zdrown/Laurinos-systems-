import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });
    if (error) setError(error.message);
    else setSuccess('Check your email for a reset link.');
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
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Send Reset Link</button>
        </form>
        <div className="auth-footer">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
