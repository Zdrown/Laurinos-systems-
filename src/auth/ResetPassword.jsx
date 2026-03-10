import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setSuccess('Password updated. Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    }
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
            <label className="auth-label">New Password</label>
            <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input className="auth-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="auth-btn">Update Password</button>
        </form>
      </div>
    </div>
  );
}
