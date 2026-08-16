import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from '@phosphor-icons/react';
import { signIn } from '../lib/auth';
import './admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      // onAuthChange in AdminApp will pick up the new session and re-render.
    } catch (err) {
      setError(err?.message === 'Invalid login credentials' ? 'Неверный email или пароль.' : (err?.message || 'Ошибка входа.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="grain" aria-hidden="true" />
      <form className="adm-login-card" onSubmit={submit}>
        <div className="adm-login-icon"><Lock size={20} weight="bold" /></div>
        <h1>Admin</h1>
        <p className="adm-login-sub">cookiekiller® — панель управления проектами</p>
        <label>
          <span>Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Пароль</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="adm-error">{error}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Вхожу…' : 'Войти'}</button>
        <Link to="/" className="adm-login-back">← На сайт</Link>
      </form>
    </div>
  );
}
