import { useState } from 'react';
import { supabase } from './supabaseClient';
import { C, TAP } from './theme';

const field = {
  width: '100%',
  // Without border-box, 100% width plus padding pushes the input past the
  // card's edge, and minHeight stacks the padding on top of the 44px.
  boxSizing: 'border-box',
  minHeight: TAP,
  background: '#14142a',
  border: `1px solid ${C.border}`,
  color: C.text,
  padding: '10px 12px',
  borderRadius: 4,
  fontSize: 16, // 16px stops iOS Safari from zooming the page on focus
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
    // On success onAuthStateChange swaps this screen out, so there is nothing
    // to do here but surface a failure.
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Wrong email or password.'
        : error.message);
      setBusy(false);
    }
  };

  return (
    <div style={{
      boxSizing: 'border-box', // else the 20px padding makes it 100vh + 40px and scrolls
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: 'system-ui,sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <form onSubmit={submit} style={{
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 28, width: 380, maxWidth: '100%',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 17, color: '#fff', letterSpacing: '.5px' }}>
          PURLIFE — HOBBS
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 22 }}>Shift Scheduler</div>

        <label style={{ display: 'block', color: C.muted, fontSize: 11, marginBottom: 4 }}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="username" autoCapitalize="none" autoCorrect="off"
          required style={{ ...field, marginBottom: 14 }}
        />

        <label style={{ display: 'block', color: C.muted, fontSize: 11, marginBottom: 4 }}>Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required style={{ ...field, marginBottom: 18 }}
        />

        {error && (
          <div style={{
            background: '#3a1f1f', color: '#e79090', border: '1px solid #5a2f2f',
            borderRadius: 4, padding: '8px 10px', fontSize: 13, marginBottom: 14,
          }}>{error}</div>
        )}

        <button type="submit" disabled={busy} style={{
          width: '100%', minHeight: TAP, background: busy ? C.border : C.accent,
          color: '#fff', border: 'none', borderRadius: 4, fontSize: 15,
          fontWeight: 'bold', cursor: busy ? 'default' : 'pointer',
        }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
