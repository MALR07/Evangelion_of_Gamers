import { FILTERS } from '../config/constants.js';
import { formatListDate } from '../utils/format.js';
import CommunityLanding from './CommunityLanding.jsx';
import { AchievementsPanel, GameCover, GameSignals } from './shared.jsx';

export default function WorkspaceContent({ data }) {
  const {
    view, communityLists, communityLoading, communityError, news, newsLoading,
    spotlight, games, darkMode, setDarkMode, communityAddingId, message, setMessage,
    addCommunityGame, setView, adminUsers, adminLoading, session, updateAdminRole,
    updateAdminPassword, adminPasswordDrafts, setAdminPasswordDrafts, removeAdminUser,
    profileUsername, setProfileUsername, profileImageUrl, setProfileImageUrl, profileSaving,
    saveProfile, createList, lists, listsLoading, selectedListId, setSelectedListId,
    setListEditing, listEditing, selectedList, toggleListVisibility, listSaving, deleteList,
    addLibraryGame, listDraft, setListDraft, saveList, updateListDraft, removeSection,
    updateSection, removeListItem, moveListItem, addListItem, addSection, counts, query,
    setQuery, searchGames, searching, results, addGame, visibleGames, activeFilter,
    setActiveFilter, gamesLoading, noteDrafts, setNoteDrafts, updateGame, addGameToList,
    openAchievements, toggleAchievements, removeGame, achievements
  } = data;

  return (
    <>
        {view === 'community' ? <CommunityLanding lists={communityLists} loading={communityLoading} error={communityError} authenticated latestNews={news} newsLoading={newsLoading} spotlight={spotlight} libraryGames={new Map(games.map((game) => [game.rawgId, game]))} darkMode={darkMode} onToggleTheme={() => setDarkMode((current) => !current)} libraryIds={new Set(games.map((game) => game.rawgId))} addingGameId={communityAddingId} actionMessage={message} onClearMessage={() => setMessage('')} onAddGame={addCommunityGame} onBack={() => setView('games')} /> : view === 'admin' ? (
          <>
            <section className="page-heading admin-page-heading"><div><p className="eyebrow">CONTROL DEL SITIO</p><h1>Administración<span className="heading-period">.</span></h1><p className="page-intro">Gestiona cuentas, permisos y acceso.</p></div><span className="admin-user-count">{adminUsers.length} CUENTAS</span></section>
            <section className="admin-section">
              {message && <p className="notice app-notice" role="status">{message}<button aria-label="Cerrar aviso" onClick={() => setMessage('')}>×</button></p>}
              {adminLoading ? <div className="empty-state">Cargando usuarios…</div> : !adminUsers.length ? <div className="empty-state">No hay cuentas para mostrar.</div> : <div className="admin-user-list">{adminUsers.map((user) => (
                <article className="admin-user-row" key={user.id}>
                  <div className="admin-user-identity"><strong>{user.username}</strong><span>{user.email}</span><small>Creada el {formatListDate(user.createdAt)}</small></div>
                  <label className="admin-role-field">PERMISOS<select value={user.role} disabled={String(user.id) === String(session.user.id)} onChange={(event) => updateAdminRole(user, event.target.value)}><option value="user">Usuario</option><option value="admin">Administrador</option></select></label>
                  <form className="admin-password-field" onSubmit={(event) => { event.preventDefault(); updateAdminPassword(user); }}><label>NUEVA CONTRASEÑA<input type="password" minLength="8" autoComplete="new-password" value={adminPasswordDrafts[user.id] ?? ''} onChange={(event) => setAdminPasswordDrafts((current) => ({ ...current, [user.id]: event.target.value }))} placeholder="Mínimo 8 caracteres" required /></label><button className="button button-add">Actualizar clave</button></form>
                  <button type="button" className="text-action remove-action admin-delete" disabled={String(user.id) === String(session.user.id)} onClick={() => removeAdminUser(user)}>Eliminar cuenta</button>
                </article>
              ))}</div>}
            </section>
            <footer className="page-footer"><span>© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span><span>GESTIÓN DE CUENTAS</span></footer>
          </>
        ) : view === 'profile' ? (
          <>
            <section className="page-heading"><div><p className="eyebrow">TU IDENTIDAD PÚBLICA</p><h1>Mi perfil<span className="heading-period">.</span></h1><p className="page-intro">El nombre y la foto aparecerán junto a tus listas de comunidad.</p></div></section>
            <section className="profile-section"><form className="profile-form" onSubmit={saveProfile}>
              <div className="profile-preview"><span className="profile-large-avatar">{profileImageUrl ? <img src={profileImageUrl} alt="Vista previa del perfil" /> : profileUsername?.[0]?.toUpperCase() || 'J'}</span><div><span>VISTA EN COMUNIDAD</span><strong>@{profileUsername || 'tu_usuario'}</strong></div></div>
              <label>Nombre de usuario<input type="text" autoComplete="nickname" minLength="3" maxLength="24" pattern="[A-Za-z0-9_-]+" value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} required /></label>
              <label>Foto de perfil · URL pública<input type="url" pattern="https://.*" maxLength="2048" value={profileImageUrl} onChange={(event) => setProfileImageUrl(event.target.value)} placeholder="https://ejemplo.com/mi-foto.jpg" /><small className="field-hint">Pega una URL HTTPS de imagen. Será visible en tus listas públicas.</small></label>
              {message && <p className="notice" role="status">{message}</p>}
              <button className="button button-dark" disabled={profileSaving}>{profileSaving ? 'Guardando…' : 'Guardar perfil'}<span aria-hidden="true">↗</span></button>
            </form></section>
            <footer className="page-footer"><span>© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span><span>TUS PARTIDAS. TU HISTORIA.</span></footer>
          </>
        ) : view === 'lists' ? (
          <>
            <section className="page-heading list-page-heading">
              <div><p className="eyebrow">TUS RECORRIDOS, A TU MANERA</p><h1>Mis listas<span className="heading-period">.</span></h1><p className="page-intro">Rankings, juegos por completar y recuerdos de cada año.</p></div>
              <button className="button button-dark" onClick={createList}>Nueva lista <span aria-hidden="true">＋</span></button>
            </section>
            <section className="lists-section">
              {message && <p className="notice app-notice" role="status">{message}<button aria-label="Cerrar aviso" onClick={() => setMessage('')}>×</button></p>}
              {listsLoading ? <div className="empty-state">Cargando tus listas…</div> : !lists.length ? <div className="empty-state"><span className="empty-glyph">☷</span><h3>Aún no has creado una lista.</h3><p>Empieza un ranking y organiza tus juegos por secciones.</p><button className="button button-dark" onClick={createList}>Crear mi primera lista <span>＋</span></button></div> : (
                <>
                  <div className="list-tabs" role="tablist" aria-label="Tus listas">{lists.map((list) => <button key={list.id} role="tab" aria-selected={selectedListId === list.id} className={selectedListId === list.id ? 'list-tab list-tab-active' : 'list-tab'} onClick={() => { setSelectedListId(list.id); setListEditing(false); }}>{list.title}{list.year ? ` · ${list.year}` : ''}</button>)}</div>
                  {selectedList && !listEditing && <div className="list-overview">
                    <div className="list-overview-heading"><div><p className="eyebrow">TU RECORRIDO</p><h2>{selectedList.title}{selectedList.year ? ` · ${selectedList.year}` : ''}</h2><p className="list-updated">Actualizada el {formatListDate(selectedList.updatedAt)}</p><span className={selectedList.isPublic ? 'list-visibility list-visibility-public' : 'list-visibility'}>{selectedList.isPublic ? 'Visible en comunidad' : 'Solo tú puedes verla'}</span></div><div className="list-overview-actions"><button className="button button-add" disabled={listSaving} onClick={toggleListVisibility}>{selectedList.isPublic ? 'Dejar de compartir' : 'Compartir lista'}<span aria-hidden="true">{selectedList.isPublic ? '◉' : '↗'}</span></button><button className="button button-add" onClick={() => setListEditing(true)}>Editar lista <span aria-hidden="true">✎</span></button><button className="text-action remove-action" onClick={deleteList}>Eliminar</button></div></div>
                    <div className="list-category-grid">{selectedList.sections.map((section, sectionIndex) => <section className="rank-category" key={`${selectedList.id}-${sectionIndex}`}>
                      <header className="rank-category-heading"><span className="rank-category-icon">{section.icon || '🎮'}</span><div><h3>{section.name}</h3><span>{section.items.length} {section.items.length === 1 ? 'JUEGO' : 'JUEGOS'}</span></div></header>
                      <label className="library-picker"><span>AÑADIR DESDE TU BIBLIOTECA</span><select value="" disabled={!games.length || listSaving} onChange={(event) => addLibraryGame(sectionIndex, event.target.value)}><option value="">{games.length ? 'Selecciona un juego…' : 'Añade juegos a tu biblioteca primero'}</option>{games.filter((game) => !section.items.some((item) => item.rawgId === game.rawgId)).map((game) => <option key={game.rawgId} value={game.rawgId}>{game.name}</option>)}</select></label>
                      {section.items.length ? <div className="ranked-game-grid">{section.items.map((item, itemIndex) => { const libraryGame = games.find((game) => game.rawgId === item.rawgId); return <article className="ranked-game-card" key={`${item.rawgId || item.title}-${itemIndex}`}><div className="ranked-game-cover">{libraryGame?.backgroundImage ? <img src={libraryGame.backgroundImage} alt={`Portada de ${item.title}`} loading="lazy" /> : <div className="cover-fallback"><span>{item.title.slice(0, 1)}</span></div>}<span className="ranked-game-number">{String(itemIndex + 1).padStart(2, '0')}</span></div><div className="ranked-game-info"><h4>{item.title}</h4>{item.note && <p>{item.note}</p>}<GameSignals game={libraryGame} /></div></article>; })}</div> : <p className="rank-category-empty">Todavía no hay juegos en esta sección.</p>}
                    </section>)}</div>
                  </div>}
                  {selectedList && listDraft && listEditing && <form className="list-editor" onSubmit={saveList}>
                    <div className="list-editor-heading"><div><p className="eyebrow">EDITAR LISTA</p><h2>{listDraft.title || 'Sin título'}{listDraft.year ? ` · ${listDraft.year}` : ''}</h2></div><button type="button" className="text-action remove-action" onClick={deleteList}>Eliminar lista</button></div>
                    <div className="list-meta-fields"><label>TÍTULO<input maxLength="120" value={listDraft.title} onChange={(event) => updateListDraft({ title: event.target.value })} required /></label><label>AÑO<input type="number" min="1900" max="2200" value={listDraft.year} onChange={(event) => updateListDraft({ year: event.target.value })} /></label></div>
                    <div className="list-sections">{listDraft.sections.map((section, sectionIndex) => <section className="list-section-editor" key={`${selectedList.id}-${sectionIndex}`}>
                      <div className="list-section-heading"><input className="section-icon-input" aria-label="Icono de sección" maxLength="8" value={section.icon} onChange={(event) => updateSection(sectionIndex, { icon: event.target.value })} /><input className="section-name-input" aria-label="Nombre de sección" maxLength="100" value={section.name} onChange={(event) => updateSection(sectionIndex, { name: event.target.value })} required /><button type="button" className="icon-button section-remove" title="Eliminar sección" aria-label="Eliminar sección" onClick={() => removeSection(sectionIndex)}>×</button></div>
                      {section.items.map((item, itemIndex) => <div className="list-item-editor" key={itemIndex}><span className="list-item-number">{String(itemIndex + 1).padStart(2, '0')}</span><input aria-label="Nombre del videojuego" maxLength="160" placeholder="Nombre del videojuego" value={item.title} onChange={(event) => updateListItem(sectionIndex, itemIndex, { title: event.target.value })} required /><input aria-label="Nota" maxLength="200" placeholder="Nota, por ejemplo: Platinado" value={item.note} onChange={(event) => updateListItem(sectionIndex, itemIndex, { note: event.target.value })} /><div className="list-item-actions"><button type="button" className="icon-button" title="Subir" aria-label="Subir videojuego" disabled={itemIndex === 0} onClick={() => moveListItem(sectionIndex, itemIndex, -1)}>↑</button><button type="button" className="icon-button" title="Bajar" aria-label="Bajar videojuego" disabled={itemIndex === section.items.length - 1} onClick={() => moveListItem(sectionIndex, itemIndex, 1)}>↓</button><button type="button" className="icon-button section-remove" title="Quitar juego" aria-label="Quitar juego" onClick={() => removeListItem(sectionIndex, itemIndex)}>×</button></div></div>)}
                      <button type="button" className="text-action add-list-item" onClick={() => addListItem(sectionIndex)}>＋ Añadir videojuego</button>
                    </section>)}</div>
                    <div className="list-editor-actions"><button type="button" className="button button-add" onClick={addSection}>＋ Añadir sección</button><div className="list-save-actions"><button type="button" className="text-action" onClick={() => { setListDraft({ title: selectedList.title, year: selectedList.year ?? '', sections: selectedList.sections, isPublic: selectedList.isPublic }); setListEditing(false); }}>Cancelar</button><button className="button button-dark" disabled={listSaving}>{listSaving ? 'Guardando…' : 'Guardar cambios'}<span aria-hidden="true">↗</span></button></div></div>
                  </form>}
                </>
              )}
            </section>
            <footer className="page-footer"><span>© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span><span>TUS PARTIDAS. TU HISTORIA.</span></footer>
          </>
        ) : <>
        <section className="page-heading">
          <div><p className="eyebrow">EL REGISTRO DE TUS PARTIDAS</p><h1>Mi biblioteca<span className="heading-period">.</span></h1><p className="page-intro">Los mundos que ya exploraste y los que te esperan.</p></div>
          <div className="heading-stats"><div><strong>{counts.all.toString().padStart(2, '0')}</strong><span>JUEGOS</span></div><div><strong>{counts.played.toString().padStart(2, '0')}</strong><span>COMPLETADOS</span></div><div><strong>{counts.platinum.toString().padStart(2, '0')}</strong><span>PLATINADOS</span></div></div>
        </section>

        <section className="search-section" aria-label="Añadir un juego">
          <div className="section-kicker"><span>01</span><h2>Añadir a la colección</h2></div>
          <form className="search-form" onSubmit={searchGames}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un videojuego…" aria-label="Buscar videojuego" /><button className="button button-dark" disabled={searching}>{searching ? 'Buscando…' : 'Buscar'}<span aria-hidden="true">↗</span></button></form>
          {results.length > 0 && <div className="search-results">{results.map((game) => <article className="result-row" key={game.id}><GameCover game={game} /><div className="result-info"><strong>{game.name}</strong><span>{game.released || 'Fecha desconocida'}{game.genres.length ? ` · ${game.genres.slice(0, 2).join(', ')}` : ''}</span></div><button className="button button-add" onClick={() => addGame(game)}>Añadir <span>＋</span></button></article>)}</div>}
        </section>

        <section className="library-section">
          <div className="library-heading"><div className="section-kicker"><span>02</span><h2>Tu archivo</h2></div><span className="library-total">{visibleGames.length} {visibleGames.length === 1 ? 'JUEGO' : 'JUEGOS'}</span></div>
          <div className="filter-row" role="tablist" aria-label="Filtrar juegos">{FILTERS.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'filter-chip filter-active' : 'filter-chip'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
          {message && <p className="notice app-notice" role="status">{message}<button aria-label="Cerrar aviso" onClick={() => setMessage('')}>×</button></p>}
          {gamesLoading ? <div className="empty-state">Cargando tu colección…</div> : visibleGames.length === 0 ? <div className="empty-state"><span className="empty-glyph">✳</span><h3>{games.length ? 'No hay juegos en esta sección.' : 'Tu próxima aventura empieza aquí.'}</h3><p>Busca un videojuego arriba y añádelo a tu biblioteca.</p></div> : (
            <div className="game-list">{visibleGames.map((game, index) => (
              <article className="game-card" key={game.rawgId}>
                <div className="game-number">{String(index + 1).padStart(2, '0')}</div>
                <GameCover game={game} large />
                <div className="game-details"><div className="game-title-line"><h3>{game.name}</h3>{game.released && <span className="release-year">{game.released.slice(0, 4)}</span>}</div>
                  <div className="game-controls"><label className="status-control"><span>ESTADO</span><select value={game.status} onChange={(event) => updateGame(game, { status: event.target.value })}>{FILTERS.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label><label className="status-control rating-control"><span>NOTA</span><select value={game.rating ?? ''} onChange={(event) => updateGame(game, { rating: event.target.value ? Number(event.target.value) : null })}><option value="">—</option>{Array.from({ length: 10 }, (_, value) => value + 1).map((value) => <option key={value} value={value}>{value}/10</option>)}</select></label></div>
                  <div className="game-tags"><button className={game.platinum ? 'tag tag-selected' : 'tag'} onClick={() => updateGame(game, { platinum: !game.platinum })}><span>✧</span> Platino</button><button className={game.replayed ? 'tag tag-selected' : 'tag'} onClick={() => updateGame(game, { replayed: !game.replayed })}><span>↻</span> Rejugado</button><button className={game.recommended ? 'tag tag-selected' : 'tag'} onClick={() => updateGame(game, { recommended: !game.recommended })}><span>♡</span> Lo recomiendo</button></div>
                  <label className="notes-field"><span>NOTAS</span><textarea value={noteDrafts[game.rawgId] ?? game.notes} onChange={(event) => setNoteDrafts((current) => ({ ...current, [game.rawgId]: event.target.value }))} onBlur={(event) => { if (event.target.value !== game.notes) updateGame(game, { notes: event.target.value }); }} placeholder="Añade una nota personal…" rows="1" /></label>
                  <label className="game-list-picker"><span>AÑADIR A UNA LISTA</span><select value="" disabled={!lists.length || listSaving} onChange={(event) => { const [listId, sectionIndex] = event.target.value.split(':'); const list = lists.find((entry) => entry.id === listId); if (list) addGameToList(game, list, Number(sectionIndex)); }}><option value="">{lists.length ? 'Selecciona lista y sección…' : 'Crea una lista primero'}</option>{lists.flatMap((list) => list.sections.map((section, sectionIndex) => section.items.some((item) => item.rawgId === game.rawgId) ? null : <option key={`${list.id}-${sectionIndex}`} value={`${list.id}:${sectionIndex}`}>{list.title} · {section.name}</option>))}</select></label>
                  <div className="game-actions"><button className="text-action" onClick={() => toggleAchievements(game)}>{openAchievements === game.rawgId ? 'Ocultar logros' : 'Ver logros'} <span>↗</span></button><button className="text-action remove-action" onClick={() => removeGame(game)}>Quitar de la lista</button></div>
                  {openAchievements === game.rawgId && <AchievementsPanel data={achievements[game.rawgId]} />}
                </div>
              </article>
            ))}</div>
          )}
        </section>
        <footer className="page-footer"><span>© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span><span>TUS PARTIDAS. TU HISTORIA.</span></footer>
        </>}
    </>
  );
}
