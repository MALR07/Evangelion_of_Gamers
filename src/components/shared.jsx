import logoImage from '../../logo.jpg';
import { SOCIAL_LINKS } from '../config/constants.js';

export function ThemeToggle({ darkMode, onToggle }) {
  const label = darkMode ? 'Activar modo claro' : 'Activar modo oscuro';
  return <button type="button" className="theme-toggle" title={label} aria-label={label} aria-pressed={darkMode} onClick={onToggle}><span aria-hidden="true">{darkMode ? '☀' : '☾'}</span></button>;
}

export function BrandLogo({ href }) {
  const content = <><img className="brand-image" src={logoImage} alt="" /><span className="brand-wordmark">Evangelion of Gamers</span></>;
  return href ? <a className="brand" href={href}>{content}</a> : <div className="brand">{content}</div>;
}

export function SiteSocialLinks() {
  return <nav className="site-social-links" aria-label="Redes y portfolio">
    {SOCIAL_LINKS.map((link) => <a key={link.name} className={link.url ? 'site-social-link' : 'site-social-link site-social-link-disabled'} href={link.url || undefined} target={link.url ? '_blank' : undefined} rel={link.url ? 'noopener noreferrer' : undefined} aria-label={link.name} aria-disabled={!link.url} title={link.url ? link.name : `Configura ${link.setting} para añadir tu enlace`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{link.icon === 'linkedin' ? <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.369 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> : link.icon === 'github' ? <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.87 10.95.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.35-3.88-1.35-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.2 1.17.93-.26 1.93-.39 2.92-.39.99 0 1.99.13 2.92.39 2.22-1.48 3.2-1.17 3.2-1.17.63 1.57.23 2.73.11 3.02.75.8 1.2 1.82 1.2 3.07 0 4.41-2.7 5.38-5.27 5.66.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" /> : <><rect x="3" y="7" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>}</svg>
    </a>)}
  </nav>;
}

export function GameSignals({ game }) {
  if (!game) return null;
  const signals = [
    game.rating ? `Nota ${game.rating}/10` : '',
    game.platinum ? 'Platino' : '',
    game.replayed ? 'Rejugado' : '',
    game.recommended ? 'Recomendado' : ''
  ].filter(Boolean);
  return <div className="game-signals">{signals.map((signal) => <span key={signal}>{signal}</span>)}{game.notes && <small>{game.notes}</small>}</div>;
}

export function GameCover({ game, large = false }) {
  return game.backgroundImage
    ? <img className={large ? 'game-cover game-cover-large' : 'game-cover'} src={game.backgroundImage} alt={`Portada de ${game.name}`} loading="lazy" />
    : <div className={large ? 'game-cover game-cover-large cover-fallback' : 'game-cover cover-fallback'} aria-label={`Sin imagen para ${game.name}`}><span>{game.name?.slice(0, 1)}</span></div>;
}

export function AchievementsPanel({ data }) {
  if (!data || data.loading) return <div className="achievements-panel">Cargando logros…</div>;
  if (data.error) return <div className="achievements-panel">{data.error}</div>;
  if (!data.results.length) return <div className="achievements-panel">RAWG no tiene logros registrados para este juego.</div>;
  return <div className="achievements-panel"><span className="achievements-title">LOGROS DE LA COMUNIDAD · {data.results.length}</span>{data.results.map((achievement) => <div className="achievement-row" key={achievement.id}><span className="achievement-icon">✧</span><div><strong>{achievement.name}</strong><p>{achievement.description || 'Logro de la comunidad'}</p></div><span className="achievement-percent">{achievement.percent}%</span></div>)}</div>;
}
