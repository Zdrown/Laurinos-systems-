import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import MainDocument from './components/MainDocument';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          session && profile
            ? <MainDocument profile={profile} onSignOut={handleSignOut} />
            : <Navigate to="/login" />
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
