import { useEffect, useMemo, useState } from 'react';
import { FEATURED_ARTWORKS, GOOGLE_CLIENT_ID, SESSION_KEY, STARTER_SECTIONS, THEME_KEY } from './config/constants.js';
import { request } from './services/api.js';
import { BrandLogo, ThemeToggle } from './components/shared.jsx';
import CommunityLanding from './components/CommunityLanding.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import WorkspaceContent from './components/WorkspaceContent.jsx';

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  });
  const [authMode, setAuthMode] = useState('landing');
  const [username, setUsername] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [gamesLoading, setGamesLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [message, setMessage] = useState('');
  const [achievements, setAchievements] = useState({});
  const [openAchievements, setOpenAchievements] = useState('');
  const [view, setView] = useState('games');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('savepoint-sidebar-collapsed') === 'true');
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [listDraft, setListDraft] = useState(null);
  const [listsLoading, setListsLoading] = useState(false);
  const [listSaving, setListSaving] = useState(false);
  const [listEditing, setListEditing] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminPasswordDrafts, setAdminPasswordDrafts] = useState({});
  const [communityLists, setCommunityLists] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState('');
  const [communityAddingId, setCommunityAddingId] = useState('');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [spotlight, setSpotlight] = useState(() => FEATURED_ARTWORKS[0]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('savepoint-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    setCommunityLoading(true);
    request('/public/lists')
      .then(({ lists: entries }) => { setCommunityLists(entries); setCommunityError(''); })
      .catch((error) => setCommunityError(error.message))
      .finally(() => setCommunityLoading(false));
  }, [view, lists.length]);

  useEffect(() => {
    let active = true;
    const loadNews = () => request('/news')
      .then(({ news: entries }) => { if (active) setNews(entries || []); })
      .catch(() => {})
      .finally(() => { if (active) setNewsLoading(false); });
    loadNews();
    const interval = window.setInterval(loadNews, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (session?.token || authMode === 'landing' || !GOOGLE_CLIENT_ID) return undefined;
    const renderGoogleButton = () => {
      const container = document.getElementById('google-signin-button');
      if (!container || !window.google?.accounts?.id) return;
      container.replaceChildren();
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
      window.google.accounts.id.renderButton(container, { theme: darkMode ? 'filled_black' : 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'rectangular' });
    };
    const script = document.getElementById('google-identity-script');
    script?.addEventListener('load', renderGoogleButton);
    renderGoogleButton();
    return () => script?.removeEventListener('load', renderGoogleButton);
  }, [authMode, darkMode, session?.token]);

  useEffect(() => {
    let active = true;
    const rotateSpotlight = () => request('/spotlight')
      .then(({ game }) => {
        if (!active || !game) return;
        if (game.id === spotlight?.id) return;
        const image = new Image();
        let shown = false;
        const showGame = () => {
          if (shown || !active) return;
          shown = true;
          setSpotlight(game);
        };
        image.onload = showGame;
        image.onerror = showGame;
        image.src = game.backgroundImage;
        window.setTimeout(showGame, 1200);
      })
      .catch(() => {
        if (!active) return;
        setSpotlight((current) => {
          const currentIndex = FEATURED_ARTWORKS.findIndex((artwork) => artwork.id === current?.id);
          return FEATURED_ARTWORKS[(currentIndex + 1 + FEATURED_ARTWORKS.length) % FEATURED_ARTWORKS.length];
        });
      });
    rotateSpotlight();
    const interval = window.setInterval(rotateSpotlight, 120 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!session?.token) return;
    request('/auth/me', { token: session.token }).then(({ user }) => {
      setSession((current) => ({ ...current, user }));
      setProfileUsername(user.username ?? '');
      setProfileImageUrl(user.profileImage ?? '');
    }).catch(() => signOut());
  }, []);

  useEffect(() => {
    if (!session?.token) return;
    setGamesLoading(true);
    request('/games', { token: session.token })
      .then(({ games: entries }) => setGames(entries))
      .catch((error) => setMessage(error.message))
      .finally(() => setGamesLoading(false));
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) return;
    setListsLoading(true);
    request('/lists', { token: session.token })
      .then(({ lists: entries }) => {
        setLists(entries);
        setSelectedListId((current) => current || entries[0]?.id || '');
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setListsLoading(false));
  }, [session?.token]);

  useEffect(() => {
    if (view !== 'admin' || session?.user?.role !== 'admin') return;
    setAdminLoading(true);
    request('/admin/users', { token: session.token })
      .then(({ users }) => setAdminUsers(users))
      .catch((error) => setMessage(error.message))
      .finally(() => setAdminLoading(false));
  }, [session?.token, session?.user?.role, view]);

  const selectedList = lists.find((list) => list.id === selectedListId);

  useEffect(() => {
    if (!selectedList) {
      setListDraft(null);
      return;
    }
    setListDraft({ title: selectedList.title, year: selectedList.year ?? '', sections: selectedList.sections, isPublic: selectedList.isPublic });
  }, [selectedListId, selectedList]);

  const visibleGames = useMemo(() => activeFilter === 'Todos'
    ? games
    : games.filter((game) => game.status === activeFilter), [games, activeFilter]);

  const counts = useMemo(() => ({
    all: games.length,
    played: games.filter((game) => game.status === 'Completado').length,
    platinum: games.filter((game) => game.platinum).length
  }), [games]);

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setGames([]);
    setLists([]);
    setSelectedListId('');
    setListDraft(null);
    setView('games');
    setAuthMode('landing');
    setProfileUsername('');
    setProfileImageUrl('');
  }

  async function submitAuth(event) {
    event.preventDefault();
    setMessage('');
    setAuthLoading(true);
    try {
      const route = authMode === 'login' ? '/auth/login' : '/auth/register';
      const data = await request(route, { method: 'POST', body: JSON.stringify({ email, password, ...(authMode === 'register' ? { username } : {}) }) });
      const nextSession = { token: data.token, user: data.user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setUsername('');
      setProfileUsername(data.user.username ?? '');
      setProfileImageUrl(data.user.profileImage ?? '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleCredential(response) {
    setMessage('');
    setGoogleLoading(true);
    try {
      const data = await request('/auth/google', { method: 'POST', body: JSON.stringify({ credential: response.credential }) });
      const nextSession = { token: data.token, user: data.user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setProfileUsername(data.user.username ?? '');
      setProfileImageUrl(data.user.profileImage ?? '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    setMessage('');
    try {
      const { user } = await request('/auth/profile', {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({ username: profileUsername, profileImage: profileImageUrl })
      });
      const nextSession = { ...session, user };
      setSession(nextSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setMessage('Perfil actualizado.');
      request('/public/lists').then(({ lists: entries }) => setCommunityLists(entries)).catch(() => {});
    } catch (error) {
      setMessage(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function searchGames(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage('');
    try {
      const data = await request(`/search?q=${encodeURIComponent(query.trim())}`, { token: session.token });
      setResults(data.results);
      if (!data.results.length) setMessage('No se encontraron juegos con ese nombre.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearching(false);
    }
  }

  async function addGame(game) {
    setMessage('');
    try {
      const { game: added } = await request('/games', {
        token: session.token,
        method: 'POST',
        body: JSON.stringify(game)
      });
      setGames((current) => [added, ...current]);
      setResults((current) => current.filter((result) => result.id !== game.id));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addCommunityGame(item, backgroundImage) {
    if (!item.rawgId) return;
    setCommunityAddingId(item.rawgId);
    setMessage('');
    try {
      const { game } = await request('/games', {
        token: session.token,
        method: 'POST',
        body: JSON.stringify({ id: item.rawgId, name: item.title, background_image: backgroundImage ?? null })
      });
      setGames((current) => [game, ...current]);
      setMessage(`${game.name} añadido a tu biblioteca.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCommunityAddingId('');
    }
  }

  async function updateGame(game, changes) {
    const previous = games;
    setGames((current) => current.map((entry) => entry.rawgId === game.rawgId ? { ...entry, ...changes } : entry));
    try {
      await request(`/games/${encodeURIComponent(game.rawgId)}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
    } catch (error) {
      setGames(previous);
      setMessage(error.message);
    }
  }

  async function removeGame(game) {
    try {
      await request(`/games/${encodeURIComponent(game.rawgId)}`, { token: session.token, method: 'DELETE' });
      setGames((current) => current.filter((entry) => entry.rawgId !== game.rawgId));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createList() {
    setMessage('');
    try {
      const { list } = await request('/lists', {
        token: session.token,
        method: 'POST',
        body: JSON.stringify({ title: 'Ranking Jugados', year: new Date().getFullYear(), sections: STARTER_SECTIONS, isPublic: false })
      });
      setLists((current) => [list, ...current]);
      setSelectedListId(list.id);
      setListEditing(true);
      setView('lists');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveList(event) {
    event.preventDefault();
    if (!selectedList || !listDraft) return;
    setListSaving(true);
    setMessage('');
    try {
      const { list } = await request(`/lists/${selectedList.id}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({ ...listDraft, year: listDraft.year === '' ? null : Number(listDraft.year) })
      });
      setLists((current) => current.map((entry) => entry.id === list.id ? list : entry));
      setListEditing(false);
      setMessage('Lista guardada.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setListSaving(false);
    }
  }

  async function deleteList() {
    if (!selectedList || !window.confirm(`¿Eliminar «${selectedList.title}»? Esta acción no se puede deshacer.`)) return;
    try {
      await request(`/lists/${selectedList.id}`, { token: session.token, method: 'DELETE' });
      const remaining = lists.filter((list) => list.id !== selectedList.id);
      setLists(remaining);
      setSelectedListId(remaining[0]?.id || '');
      setListEditing(false);
      setMessage('Lista eliminada.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function toggleListVisibility() {
    if (!selectedList) return;
    setListSaving(true);
    setMessage('');
    try {
      const { list } = await request(`/lists/${selectedList.id}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({
          title: selectedList.title,
          year: selectedList.year,
          sections: selectedList.sections,
          isPublic: !selectedList.isPublic
        })
      });
      setLists((current) => current.map((entry) => entry.id === list.id ? list : entry));
      setMessage(list.isPublic ? 'Lista compartida con la comunidad.' : 'La lista ahora es privada.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setListSaving(false);
    }
  }

  async function updateAdminRole(user, role) {
    try {
      await request(`/admin/users/${user.id}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      setAdminUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, role } : entry));
      setMessage(`Permisos actualizados para ${user.username}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateAdminPassword(user) {
    const newPassword = adminPasswordDrafts[user.id] ?? '';
    if (newPassword.length < 8) {
      setMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      await request(`/admin/users/${user.id}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({ newPassword })
      });
      setAdminPasswordDrafts((current) => ({ ...current, [user.id]: '' }));
      setMessage(`Contraseña actualizada para ${user.username}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeAdminUser(user) {
    if (!window.confirm(`¿Eliminar la cuenta de ${user.username} (${user.email})? También se borrarán sus listas y juegos.`)) return;
    try {
      await request(`/admin/users/${user.id}`, { token: session.token, method: 'DELETE' });
      setAdminUsers((current) => current.filter((entry) => entry.id !== user.id));
      setMessage(`Cuenta de ${user.username} eliminada.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function updateListDraft(update) {
    setListDraft((current) => ({ ...current, ...update }));
  }

  function updateSection(sectionIndex, update) {
    const sections = listDraft.sections.map((section, index) => index === sectionIndex ? { ...section, ...update } : section);
    updateListDraft({ sections });
  }

  function updateListItem(sectionIndex, itemIndex, update) {
    const sections = listDraft.sections.map((section, index) => index === sectionIndex
      ? { ...section, items: section.items.map((item, position) => position === itemIndex ? { ...item, ...update } : item) }
      : section);
    updateListDraft({ sections });
  }

  function addSection() {
    updateListDraft({ sections: [...listDraft.sections, { name: 'Nueva sección', icon: '🎮', items: [] }] });
  }

  function addListItem(sectionIndex) {
    const section = listDraft.sections[sectionIndex];
    updateSection(sectionIndex, { items: [...section.items, { title: '', note: '' }] });
  }

  function removeSection(sectionIndex) {
    updateListDraft({ sections: listDraft.sections.filter((_, index) => index !== sectionIndex) });
  }

  function removeListItem(sectionIndex, itemIndex) {
    const section = listDraft.sections[sectionIndex];
    updateSection(sectionIndex, { items: section.items.filter((_, index) => index !== itemIndex) });
  }

  function moveListItem(sectionIndex, itemIndex, offset) {
    const section = listDraft.sections[sectionIndex];
    const nextIndex = itemIndex + offset;
    if (nextIndex < 0 || nextIndex >= section.items.length) return;
    const items = [...section.items];
    [items[itemIndex], items[nextIndex]] = [items[nextIndex], items[itemIndex]];
    updateSection(sectionIndex, { items });
  }

  async function addGameToList(game, list, sectionIndex) {
    const section = list.sections[sectionIndex];
    if (section.items.some((item) => item.rawgId === game.rawgId)) return;
    const sections = list.sections.map((entry, index) => index === sectionIndex
      ? { ...entry, items: [...entry.items, { title: game.name, note: '', rawgId: game.rawgId }] }
      : entry);
    setListSaving(true);
    setMessage('');
    try {
      const { list: updatedList } = await request(`/lists/${list.id}`, {
        token: session.token,
        method: 'PATCH',
        body: JSON.stringify({ title: list.title, year: list.year, sections, isPublic: list.isPublic })
      });
      setLists((current) => current.map((entry) => entry.id === updatedList.id ? updatedList : entry));
      setMessage(`${game.name} añadido a «${section.name}».`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setListSaving(false);
    }
  }

  async function addLibraryGame(sectionIndex, rawgId) {
    const game = games.find((entry) => entry.rawgId === rawgId);
    if (selectedList && game) await addGameToList(game, selectedList, sectionIndex);
  }

  async function toggleAchievements(game) {
    if (openAchievements === game.rawgId) {
      setOpenAchievements('');
      return;
    }
    setOpenAchievements(game.rawgId);
    if (achievements[game.rawgId]) return;
    setAchievements((current) => ({ ...current, [game.rawgId]: { loading: true, results: [] } }));
    try {
      const data = await request(`/games/${encodeURIComponent(game.rawgId)}/achievements`, { token: session.token });
      setAchievements((current) => ({ ...current, [game.rawgId]: { loading: false, results: data.results } }));
    } catch (error) {
      setAchievements((current) => ({ ...current, [game.rawgId]: { loading: false, error: error.message, results: [] } }));
    }
  }

  const workspaceData = {
    view, communityLists, communityLoading, communityError, news, newsLoading, spotlight,
    games, darkMode, setDarkMode, communityAddingId, message, setMessage, addCommunityGame, setView,
    adminUsers, adminLoading, session, updateAdminRole, updateAdminPassword, adminPasswordDrafts,
    setAdminPasswordDrafts, removeAdminUser, profileUsername, setProfileUsername, profileImageUrl,
    setProfileImageUrl, profileSaving, saveProfile, createList, lists, listsLoading, selectedListId,
    setSelectedListId, setListEditing, listEditing, selectedList, toggleListVisibility, listSaving, deleteList,
    addLibraryGame, listDraft, setListDraft, saveList, updateListDraft, removeSection, updateSection, removeListItem,
    moveListItem, addListItem, addSection, counts, query, setQuery, searchGames, searching, results,
    addGame, visibleGames, activeFilter, setActiveFilter, gamesLoading, noteDrafts, setNoteDrafts,
    updateGame, addGameToList, openAchievements, toggleAchievements, removeGame, achievements
  };
  if (!session?.token) {
    if (authMode === 'landing') {
      return <CommunityLanding lists={communityLists} loading={communityLoading} error={communityError} latestNews={news} newsLoading={newsLoading} spotlight={spotlight} libraryGames={new Map(games.map((game) => [game.rawgId, game]))} darkMode={darkMode} onToggleTheme={() => setDarkMode((current) => !current)} onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    }
    return <AuthScreen
      authMode={authMode}
      username={username}
      setUsername={setUsername}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      message={message}
      authLoading={authLoading}
      googleLoading={googleLoading}
      darkMode={darkMode}
      spotlight={spotlight}
      onToggleTheme={() => setDarkMode((current) => !current)}
      onSubmit={submitAuth}
      onBack={() => {
        setAuthMode('landing');
        setUsername('');
        setEmail('');
        setPassword('');
        setMessage('');
      }}
      onSwitchMode={() => {
        setAuthMode((current) => current === 'login' ? 'register' : 'login');
        setUsername('');
        setEmail('');
        setPassword('');
        setMessage('');
      }}
    />;
  }

  return (
    <div className={sidebarCollapsed ? 'app-shell sidebar-is-collapsed' : 'app-shell'}>
      <aside className="sidebar">
        <div className="sidebar-brand-stack"><BrandLogo href="#top" />
          <button type="button" className="sidebar-toggle icon-button" title={sidebarCollapsed ? 'Expandir barra lateral' : 'Ocultar barra lateral'} aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Ocultar barra lateral'} aria-pressed={sidebarCollapsed} onClick={() => setSidebarCollapsed((current) => !current)}>{sidebarCollapsed ? '⇥' : '⇤'}</button>
        </div>
        <div className="side-label">BIBLIOTECA</div>
        <button className={view === 'games' ? 'side-link side-link-active' : 'side-link'} onClick={() => setView('games')}><span>▦</span> Mis juegos <span className="side-count">{counts.all}</span></button>
        <button className={view === 'lists' ? 'side-link side-link-active' : 'side-link'} onClick={() => setView('lists')}><span>☷</span> Mis listas <span className="side-count">{lists.length}</span></button>
        <button className={view === 'community' ? 'side-link side-link-active' : 'side-link'} onClick={() => setView('community')}><span>◎</span> Comunidad <span className="side-count">{communityLists.length}</span></button>
        <button className={view === 'profile' ? 'side-link side-link-active' : 'side-link'} onClick={() => setView('profile')}><span>◉</span> Mi perfil</button>
        {session.user?.role === 'admin' && <button className={view === 'admin' ? 'side-link side-link-active' : 'side-link'} onClick={() => setView('admin')}><span>⚙</span> Administración</button>}
        <div className="sidebar-bottom"><span className="user-avatar">{session.user?.profileImage ? <img className="profile-avatar-image" src={session.user.profileImage} alt={`Foto de ${session.user.username}`} /> : session.user?.username?.[0]?.toUpperCase() ?? 'J'}</span><div className="user-info"><strong>{session.user?.username ?? 'Mi cuenta'}</strong><span>Mi cuenta</span></div><button className="icon-button logout" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={signOut}>↪</button></div>
      </aside>

      <main className="main-content" id="top">
        {view !== 'community' && <header className="topbar"><span>MI ESPACIO <span className="crumb">/</span> {view === 'games' ? 'VIDEOJUEGOS' : view === 'lists' ? 'LISTAS' : view === 'admin' ? 'ADMINISTRACIÓN' : 'PERFIL'}</span><div className="topbar-actions"><span className="online-dot">TU COLECCIÓN, SIEMPRE A MANO</span><ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((current) => !current)} /></div></header>}
<WorkspaceContent data={workspaceData} />
      </main>
    </div>
  );
}

export default App;
