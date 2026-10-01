import { useEffect, useRef, useState } from 'react';
import { GameSignals, SiteSocialLinks, ThemeToggle, BrandLogo } from './shared.jsx';
import { formatListDate } from '../utils/format.js';

export default function CommunityLanding({
  lists,
  loading,
  error,
  authenticated = false,
  darkMode,
  onToggleTheme,
  libraryIds = new Set(),
  libraryGames = new Map(),
  addingGameId = '',
  actionMessage = '',
  onClearMessage,
  onAddGame,
  onLogin,
  onRegister,
  onBack,
  latestNews = [],
  newsLoading = false,
  spotlight
}) {
  const [newsIndex, setNewsIndex] = useState(0);
  const [newsTransitioning, setNewsTransitioning] = useState(false);
  const [authorQuery, setAuthorQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedLists, setExpandedLists] = useState({});
  const newsTransitionTimer = useRef(null);
  const newsChangeLock = useRef(false);
  const newsIndexRef = useRef(0);
  const activeNewsIdRef = useRef('');
  const activeNews = latestNews[newsIndex] ?? null;
  const normalizedAuthorQuery = authorQuery.trim().toLocaleLowerCase('es');
  const visibleLists = normalizedAuthorQuery
    ? lists.filter((list) => (list.username || '').toLocaleLowerCase('es').includes(normalizedAuthorQuery))
    : lists;
  const awardNews = latestNews.filter((entry) => /the game awards|game awards|nominad|nominat/i.test(`${entry.title} ${entry.description}`)).slice(0, 3);

  useEffect(() => {
    if (!latestNews.length) return undefined;
    const id = window.setInterval(() => {
      selectNews((newsIndexRef.current + 1) % latestNews.length);
    }, 9000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(newsTransitionTimer.current);
    };
  }, [latestNews.length]);

  useEffect(() => {
    if (!activeNewsIdRef.current && activeNews?.id) activeNewsIdRef.current = activeNews.id;
  }, [activeNews?.id]);

  useEffect(() => {
    if (!latestNews.length) return;
    const preservedIndex = latestNews.findIndex((entry) => entry.id === activeNewsIdRef.current);
    if (preservedIndex >= 0 && preservedIndex !== newsIndex) {
      newsIndexRef.current = preservedIndex;
      setNewsIndex(preservedIndex);
    } else if (newsIndex >= latestNews.length) {
      newsIndexRef.current = 0;
      setNewsIndex(0);
    }
  }, [latestNews, newsIndex]);

  function selectNews(nextIndex) {
    if (nextIndex === newsIndex || newsChangeLock.current || !latestNews.length) return;
    newsChangeLock.current = true;
    window.clearTimeout(newsTransitionTimer.current);
    activeNewsIdRef.current = latestNews[nextIndex]?.id ?? activeNewsIdRef.current;
    const image = new Image();
    let resolved = false;
    const beginTransition = () => {
      if (resolved) return;
      resolved = true;
      newsIndexRef.current = nextIndex;
      setNewsIndex(nextIndex);
      setNewsTransitioning(false);
      newsChangeLock.current = false;
    };
    image.onload = beginTransition;
    image.onerror = beginTransition;
    image.src = latestNews[nextIndex]?.image || '';
    newsTransitionTimer.current = window.setTimeout(beginTransition, 900);
  }

  return (
    <main className={authenticated ? 'community-page community-page-embedded' : 'community-page'}>
      <header className="community-nav"><BrandLogo href="#top" /><div className="community-nav-actions"><ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />{authenticated ? <button className="button button-dark" onClick={onBack}>Mi biblioteca <span aria-hidden="true">↗</span></button> : <><button className="text-action" onClick={onLogin}>Iniciar sesión</button><button className="button button-dark" onClick={onRegister}>Crear cuenta <span aria-hidden="true">↗</span></button></>}</div></header>

      {activeNews ? (
        <section className="news-carousel" aria-label="Noticias de videojuegos">
          <div key={`news-image-${activeNews.id}`} className={newsTransitioning ? 'news-carousel-image news-carousel-changing' : 'news-carousel-image news-carousel-entering'}><img src={activeNews.image} alt="" /><span className="news-image-label">PRENSA DE VIDEOJUEGOS</span></div>
          <div key={`news-copy-${activeNews.id}`} className={newsTransitioning ? 'news-carousel-copy news-carousel-changing' : 'news-carousel-copy news-carousel-entering'} aria-live="polite">
            <span className="news-badge">DESTACADO <span aria-hidden="true">/</span> {activeNews.subtitle}</span>
            <h3>{activeNews.title}</h3>
            <p>{activeNews.description}</p>
            <a className="news-read-link" href={activeNews.url} target="_blank" rel="noopener noreferrer">Leer artículo original <span aria-hidden="true">↗</span></a>
            <div className="news-carousel-bottom">
              <div className="news-carousel-indicators" aria-label={`Noticia ${newsIndex + 1} de ${latestNews.length}`}>
                {latestNews.map((entry, index) => <button key={entry.id} type="button" className={index === newsIndex ? 'news-indicator news-indicator-active' : 'news-indicator'} aria-label={`Mostrar noticia ${index + 1}: ${entry.title}`} aria-current={index === newsIndex ? 'true' : undefined} onClick={() => selectNews(index)} />)}
              </div>
              <div className="news-carousel-controls">
                <span>{String(newsIndex + 1).padStart(2, '0')} <span aria-hidden="true">/</span> {String(latestNews.length).padStart(2, '0')}</span>
                <button type="button" aria-label="Noticia anterior" onClick={() => selectNews((newsIndex - 1 + latestNews.length) % latestNews.length)}>‹</button>
                <button type="button" aria-label="Noticia siguiente" onClick={() => selectNews((newsIndex + 1) % latestNews.length)}>›</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="news-empty" aria-live="polite"><div><span className="news-empty-kicker">ACTUALIDAD · MEDIOS DE VIDEOJUEGOS</span><h2>Noticias de videojuegos</h2><p>{newsLoading ? 'Buscando los últimos titulares…' : 'No hay titulares disponibles ahora mismo.'}</p></div><nav aria-label="Medios de videojuegos"><a href="https://vandal.elespanol.com/noticias/videojuegos/" target="_blank" rel="noopener noreferrer">Vandal <span aria-hidden="true">↗</span></a><a href="https://www.hobbyconsolas.com/videojuegos" target="_blank" rel="noopener noreferrer">Hobby Consolas <span aria-hidden="true">↗</span></a></nav></section>
      )}

      <section className="community-hero"><div><p className="eyebrow">EVANGELION OF GAMERS <span className="crumb">/</span> COMUNIDAD</p><h1>Listas para<br />tu próxima partida<span>.</span></h1><p className="page-intro">Rankings y recorridos públicos de jugadores. Explora lo que otros han completado, rejugado o dejado pendiente. No mostramos correos ni bibliotecas privadas.</p></div><div className="community-hero-count"><strong>{lists.length.toString().padStart(2, '0')}</strong><span>LISTAS<br />COMPARTIDAS</span></div></section>

      {spotlight && <section key={spotlight.id} className="game-spotlight" aria-label="Juego aleatorio destacado"><img className="game-spotlight-image" src={spotlight.backgroundImage} alt="" /><div className="game-spotlight-copy"><span>UNA PARTIDA AL AZAR</span><h2>{spotlight.name}</h2><p>{spotlight.released ? `Lanzado en ${spotlight.released.slice(0, 4)}` : 'Descubre algo nuevo'}{spotlight.rating ? ` · Valoración RAWG ${spotlight.rating.toFixed(1)}/5` : ''}</p><a href={spotlight.url || `https://rawg.io/games/${encodeURIComponent(spotlight.slug)}`} target="_blank" rel="noopener noreferrer">Descubrir juego <span aria-hidden="true">↗</span></a></div></section>}

      <section className="community-feed"><header className="community-feed-heading"><div><p className="eyebrow">DESCUBRE</p><h2>Listas de la comunidad</h2></div><span>{lists.length} {lists.length === 1 ? 'LISTA' : 'LISTAS'}</span></header>
        {actionMessage && <p className="notice app-notice" role="status">{actionMessage}<button aria-label="Cerrar aviso" onClick={onClearMessage}>×</button></p>}
        {!loading && !error && lists.length > 0 && <label className="community-search"><span>BUSCAR LISTAS POR USUARIO</span><input type="search" value={authorQuery} onChange={(event) => setAuthorQuery(event.target.value)} placeholder="Escribe un nombre de usuario…" /></label>}
        {loading ? <div className="community-empty">Cargando listas…</div> : error ? <div className="community-empty" role="alert">{error}</div> : !lists.length ? <div className="community-empty"><span className="empty-glyph">☷</span><h3>Aún no hay listas compartidas.</h3><p>{authenticated ? 'Vuelve a tu espacio y crea la primera lista.' : 'Crea una cuenta para empezar la primera.'}</p>{authenticated ? <button className="button button-dark" onClick={onBack}>Mi biblioteca <span>↗</span></button> : <button className="button button-dark" onClick={onRegister}>Crear cuenta <span>↗</span></button>}</div> : !visibleLists.length ? <div className="community-empty" role="status"><span className="empty-glyph">⌕</span><h3>No hay listas públicas de ese usuario.</h3><p>Prueba con otro nombre de usuario.</p></div> : <div className="community-list-grid">{visibleLists.map((list) => {
          const covers = new Map((list.covers ?? []).map((cover) => [cover.rawgId, cover.backgroundImage]));
          const isListExpanded = expandedLists[list.id] ?? false;
          const listContentId = `community-list-content-${list.id}`;
          return <article className="community-list-card" key={list.id}>
            <header className="community-list-heading"><div className="community-list-author"><span className="community-avatar">{list.profileImage ? <img src={list.profileImage} alt={`Foto de ${list.username}`} loading="lazy" /> : list.username?.[0]?.toUpperCase() || 'J'}</span><div><strong className="community-list-username">@{list.username || 'jugador'}</strong><span className="community-list-meta">LISTA COMPARTIDA{list.year ? ` · ${list.year}` : ''}</span><h3>{list.title}</h3></div></div><div className="community-list-header-actions"><div className="community-list-updated"><span>ACTUALIZADA</span><time dateTime={list.updatedAt}>{formatListDate(list.updatedAt)}</time></div><button type="button" className="community-list-toggle" aria-expanded={isListExpanded} aria-controls={listContentId} onClick={() => setExpandedLists((current) => ({ ...current, [list.id]: !isListExpanded }))}>{isListExpanded ? 'Ocultar lista ↑' : 'Ver lista ↓'}</button></div></header>
            {isListExpanded && <div className="community-section-grid" id={listContentId}>{list.sections.map((section, sectionIndex) => {
              const sectionKey = `${list.id}:${sectionIndex}`;
              const isExpanded = expandedCategories[sectionKey] ?? false;
              const visibleItems = isExpanded ? section.items : section.items.slice(0, 3);
              return <section className="community-category" key={sectionKey}><h4><span>{section.icon || '🎮'}</span>{section.name}</h4>{section.items.length ? <><ol>{visibleItems.map((item, itemIndex) => { const cover = item.rawgId ? covers.get(item.rawgId) : null; const inLibrary = item.rawgId ? libraryIds.has(item.rawgId) : false; return <li className="community-game-row" key={`${item.rawgId || item.title}-${itemIndex}`}><span className="community-game-number">{String(itemIndex + 1).padStart(2, '0')}</span>{cover ? <img src={cover} alt={`Portada de ${item.title}`} loading="lazy" /> : <span className="community-cover-fallback">{item.title.slice(0, 1)}</span>}<div><strong>{item.title}</strong>{item.note && <small>{item.note}</small>}<GameSignals game={item.gameMeta ?? libraryGames.get(item.rawgId)} />{authenticated && item.rawgId && <button className="community-add-button" disabled={inLibrary || addingGameId === item.rawgId} onClick={() => onAddGame(item, cover)}>{inLibrary ? 'En mi biblioteca' : addingGameId === item.rawgId ? 'Añadiendo…' : '＋ Añadir a mi biblioteca'}</button>}</div></li>; })}</ol>{section.items.length > 3 && <button type="button" className="community-expand-button" aria-expanded={isExpanded} onClick={() => setExpandedCategories((current) => ({ ...current, [sectionKey]: !isExpanded }))}>{isExpanded ? 'Mostrar menos ↑' : `Ver ${section.items.length - 3} más ↓`}</button>}</> : <p className="community-category-empty">Sin juegos todavía.</p>}</section>;
            })}</div>}
          </article>;
        })}</div>}
      </section>

      <section className="awards-section" aria-labelledby="awards-title">
        <header className="awards-heading"><div><h2 id="awards-title">The Game Awards<span>.</span></h2><p>Seguimos las noticias de nominaciones automáticamente. La lista oficial se publica en la web de The Game Awards.</p></div><a className="awards-official-link" href="https://thegameawards.com/nominees" target="_blank" rel="noopener noreferrer">Ver nominados oficiales <span aria-hidden="true">↗</span></a></header>
        {awardNews.length ? <div className="awards-news-grid">{awardNews.map((entry) => <a className="awards-news-item" href={entry.url} target="_blank" rel="noopener noreferrer" key={entry.id}><span>{entry.subtitle}</span><strong>{entry.title}</strong><small>Leer noticia <span aria-hidden="true">↗</span></small></a>)}</div> : <p className="awards-empty">Cuando los medios publiquen novedades de nominaciones, aparecerán aquí. Normalmente se anuncian a mediados de noviembre.</p>}
        <a className="awards-photo" href="https://thegameawards.com/nominees" target="_blank" rel="noopener noreferrer" aria-label="Abrir The Game Awards"><img src="https://cdn.thegameawards.com/frontend/jpegs/TGA_22_WEB_HERO_16x9_V2.jpg" alt="" loading="lazy" /><span>IMAGEN PROVISIONAL · THE GAME AWARDS</span></a>
      </section>
      <footer className="community-footer"><span>© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span><span>JUGAMOS. COMPARTIMOS.</span><SiteSocialLinks /></footer>
    </main>
  );
}
