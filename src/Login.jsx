import { useState } from 'react';
import { supabase } from './supabaseClient';

// Standalone sign-in screen. The scheduler used to show a public read-only
// view and pop a modal only for managers; anon reads are gone, so an
// unauthenticated visitor now sees zero workers and zero shifts. There is
// nothing to show before signing in.
const field = {
  width: '100%',
  minHeight: 44, // iPad tap target
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '10px 12px',
  fontSize: 16, // stops iOS Safari zooming on focus
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Wrong email or password.'
        : error.message);
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f5',
      fontFamily: 'system-ui,sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <form onSubmit={submit} style={{
        background: '#fff', border: '1px solid #ddd', borderRadius: 8,
        padding: 28, width: 380, maxWidth: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,.08)',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 17 }}>PURLIFE — HOBBS</div>
        <div style={{ fontSize: 12, color: '#777', marginBottom: 22 }}>Scheduler</div>

        <label style={{ display: 'block', color: '#777', fontSize: 11, marginBottom: 4 }}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="username" autoCapitalize="none" autoCorrect="off"
          required style={{ ...field, marginBottom: 14 }}
        />

        <label style={{ display: 'block', color: '#777', fontSize: 11, marginBottom: 4 }}>Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required style={{ ...field, marginBottom: 18 }}
        />

        {error && (
          <div style={{
            background: '#fdecea', color: '#a4342b', border: '1px solid #f5c6c2',
            borderRadius: 4, padding: '8px 10px', fontSize: 13, marginBottom: 14,
          }}>{error}</div>
        )}

        <button type="submit" disabled={busy} style={{
          width: '100%', minHeight: 44, background: busy ? '#9e9e9e' : '#4caf50',
          color: '#fff', border: 'none', borderRadius: 4, fontSize: 15,
          fontWeight: 'bold', cursor: busy ? 'default' : 'pointer',
        }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
