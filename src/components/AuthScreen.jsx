import logoImage from '../../logo.jpg';
import { GOOGLE_CLIENT_ID } from '../config/constants.js';
import { BrandLogo, ThemeToggle } from './shared.jsx';

export default function AuthScreen({
  authMode,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  message,
  authLoading,
  googleLoading,
  darkMode,
  spotlight,
  onToggleTheme,
  onSubmit,
  onBack,
  onSwitchMode
}) {
  const isLogin = authMode === 'login';

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        {spotlight?.backgroundImage && <img key={spotlight.id} className="auth-background" src={spotlight.backgroundImage} alt="" />}
        <BrandLogo />
        <div className="auth-art" aria-hidden="true"><img className="auth-center-logo" src={logoImage} alt="" /></div>
        <p className="visual-caption">Cada partida deja<br />una historia.</p>
      </section>
      <section className="auth-panel">
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
        <div className="auth-form-wrap">
          <button className="text-action auth-back" onClick={onBack}>← Volver al landing</button>
          <p className="eyebrow">TU BIBLIOTECA, A TU MANERA</p>
          <h1>{isLogin ? 'Qué bueno\nverte de nuevo.' : 'Empieza tu\ncolección.'}</h1>
          <p className="auth-subtitle">Guarda tus partidas, tus logros y todo lo que merece la pena volver a jugar.</p>
          <form className="auth-form" onSubmit={onSubmit}>
            {!isLogin && <label>Nombre de usuario<input type="text" autoComplete="nickname" minLength="3" maxLength="24" pattern="[A-Za-z0-9_-]+" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Tu nombre público" title="Usa de 3 a 24 letras, números, guiones o guiones bajos." required /><small className="field-hint">Este nombre aparecerá junto a tus listas públicas.</small></label>}
            <label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /></label>
            <label>Contraseña<input type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={!isLogin ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={!isLogin ? 'Mínimo 8 caracteres' : 'Tu contraseña'} required /></label>
            {message && <p className="notice" role="alert">{message}</p>}
            <button className="button button-primary auth-submit" disabled={authLoading}>{authLoading ? 'Un momento…' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}<span aria-hidden="true">↗</span></button>
          </form>
          <div className="google-login-area"><span>o continúa con</span>{GOOGLE_CLIENT_ID ? <div id="google-signin-button" aria-label="Continuar con Google" /> : <button type="button" className="google-fallback-button" disabled title="Configura VITE_GOOGLE_CLIENT_ID para activar Google"><span aria-hidden="true">G</span> Continuar con Google</button>}{googleLoading && <small>Verificando cuenta…</small>}</div>
          <p className="auth-switch">{isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={onSwitchMode}>{isLogin ? 'Crear cuenta' : 'Iniciar sesión'}</button></p>
        </div>
        <span className="auth-foot">© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span>
      </section>
    </main>
  );
}
