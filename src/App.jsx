import { useEffect, useMemo, useRef, useState } from 'react';
import logoImage from '../logo.jpg';

const SESSION_KEY = 'savepoint-session';
const THEME_KEY = 'savepoint-theme';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: import.meta.env.VITE_LINKEDIN_URL, setting: 'VITE_LINKEDIN_URL', icon: 'linkedin' },
  { name: 'Portfolio', url: import.meta.env.VITE_PORTFOLIO_URL, setting: 'VITE_PORTFOLIO_URL', icon: 'portfolio' },
  { name: 'GitHub', url: import.meta.env.VITE_GITHUB_URL, setting: 'VITE_GITHUB_URL', icon: 'github' }
];
const FEATURED_ARTWORKS = [
  { id: 'destiny-1', name: 'Destiny', backgroundImage: 'https://cdnb.artstation.com/p/assets/images/images/100/059/533/large/joseph-biwald-destiny-collection-key-art-jb-box-art.webp?1781739421', url: 'https://en.wikipedia.org/wiki/Destiny_(video_game)' },
  { id: 'destiny-2', name: 'Destiny 2', backgroundImage: 'https://cdna.artstation.com/p/assets/images/images/100/059/376/large/joseph-biwald-d2-collection-key-art-jb-box-art.webp?1781738600', url: 'https://store.steampowered.com/app/1085660/Destiny_2/' },
  { id: 'persona-5-royal', name: 'Persona 5 Royal', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/library_hero.jpg', url: 'https://store.steampowered.com/app/1687950/Persona_5_Royal/' },
  { id: 'silent-hill-2', name: 'Silent Hill 2', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_hero.jpg', url: 'https://store.steampowered.com/app/2124490/SILENT_HILL_2/' },
  { id: 'god-of-war-ragnarok', name: 'God of War Ragnarök', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_hero.jpg', url: 'https://store.steampowered.com/app/2322010/God_of_War_Ragnarok/' },
  { id: 'spider-man-remastered', name: 'Marvel’s Spider-Man Remastered', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg', url: 'https://store.steampowered.com/app/1817070/Marvels_SpiderMan_Remastered/' },
  { id: 'marvel-wolverine', name: 'Marvel’s Wolverine', backgroundImage: 'https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020.jpg?w=940&thumb=false', url: 'https://store.playstation.com/en-us/product/UP9000-PPSA03671_00-MARVELSWOLVERINE' },
  { id: 'alan-wake-2', name: 'Alan Wake 2', backgroundImage: 'https://www.alanwake.com/wp-content/uploads/2023/10/AWII_Launch_054.png', url: 'https://www.alanwake.com/' },
  { id: 'the-last-of-us-part-1', name: 'The Last of Us Part I', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_hero.jpg', url: 'https://store.steampowered.com/app/1888930/The_Last_of_Us_Part_I/' },
  { id: 'cod-black-ops-iii', name: 'Call of Duty: Black Ops III Zombies', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/311210/library_hero.jpg', url: 'https://store.steampowered.com/app/311210/Call_of_Duty_Black_Ops_III/' },
  { id: 'death-stranding-2', name: 'Death Stranding 2: On the Beach', backgroundImage: 'https://gmedia.playstation.com/is/image/SIEPDC/death-stranding-2-hero-desktop-01-en-10mar25?$1200px$', url: 'https://www.playstation.com/en-us/games/death-stranding-2-on-the-beach/' },
  { id: 'nier-automata', name: 'NieR: Automata', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/524220/library_hero.jpg', url: 'https://store.steampowered.com/app/524220/NieRAutomata/' },
  { id: 'helldivers-2', name: 'Helldivers 2', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/library_hero.jpg', url: 'https://store.steampowered.com/app/553850/HELLDIVERS_2/' },
  { id: 'bloodborne', name: 'Bloodborne', backgroundImage: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2614/O2Z66UWrZH8zcejxopwWxhGu.png?w=940&thumb=false', url: 'https://www.playstation.com/en-us/games/bloodborne/' },
  { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', backgroundImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg', url: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/' }
];
const FILTERS = ['Todos', 'Pendiente', 'Jugando', 'Completado', 'Abandonado'];
const STARTER_SECTIONS = [
  { name: 'Completados', icon: '🏆', items: [] },
  { name: 'Rejugados', icon: '🔁', items: [] },
  { name: 'En proceso / con intención de completarlos', icon: '⏳', items: [] },
  { name: 'Abandonados (de momento)', icon: '💤', items: [] }
];

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
  return data;
}

function formatListDate(value) {
  if (!value) return 'Fecha desconocida';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

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

  if (!session?.token) {
    if (authMode === 'landing') {
      return <CommunityLanding lists={communityLists} loading={communityLoading} error={communityError} latestNews={news} newsLoading={newsLoading} spotlight={spotlight} libraryGames={new Map(games.map((game) => [game.rawgId, game]))} darkMode={darkMode} onToggleTheme={() => setDarkMode((current) => !current)} onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
    }
    return (
      <main className="auth-shell">
        <section className="auth-visual">
          {spotlight?.backgroundImage && <img key={spotlight.id} className="auth-background" src={spotlight.backgroundImage} alt="" />}
          <BrandLogo />
          <div className="auth-art" aria-hidden="true"><img className="auth-center-logo" src={logoImage} alt="" /></div>
          <p className="visual-caption">Cada partida deja<br />una historia.</p>
        </section>
        <section className="auth-panel">
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((current) => !current)} />
          <div className="auth-form-wrap">
            <button className="text-action auth-back" onClick={() => {
              setAuthMode('landing');
              setUsername('');
              setEmail('');
              setPassword('');
              setMessage('');
            }}>← Volver al landing</button>
            <p className="eyebrow">TU BIBLIOTECA, A TU MANERA</p>
            <h1>{authMode === 'login' ? 'Qué bueno\nverte de nuevo.' : 'Empieza tu\ncolección.'}</h1>
            <p className="auth-subtitle">Guarda tus partidas, tus logros y todo lo que merece la pena volver a jugar.</p>
            <form className="auth-form" onSubmit={submitAuth}>
              {authMode === 'register' && <label>Nombre de usuario<input type="text" autoComplete="nickname" minLength="3" maxLength="24" pattern="[A-Za-z0-9_-]+" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Tu nombre público" title="Usa de 3 a 24 letras, números, guiones o guiones bajos." required /><small className="field-hint">Este nombre aparecerá junto a tus listas públicas.</small></label>}
              <label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /></label>
              <label>Contraseña<input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={authMode === 'register' ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authMode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'} required /></label>
              {message && <p className="notice" role="alert">{message}</p>}
              <button className="button button-primary auth-submit" disabled={authLoading}>{authLoading ? 'Un momento…' : authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}<span aria-hidden="true">↗</span></button>
            </form>
            <div className="google-login-area"><span>o continúa con</span>{GOOGLE_CLIENT_ID ? <div id="google-signin-button" aria-label="Continuar con Google" /> : <button type="button" className="google-fallback-button" disabled title="Configura VITE_GOOGLE_CLIENT_ID para activar Google"><span aria-hidden="true">G</span> Continuar con Google</button>}{googleLoading && <small>Verificando cuenta…</small>}</div>
            <p className="auth-switch">{authMode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setUsername(''); setEmail(''); setPassword(''); setMessage(''); }}>{authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}</button></p>
          </div>
          <span className="auth-foot">© 2026 EVANGELION OF GAMERS · HECHO POR MALR07</span>
        </section>
      </main>
    );
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
      </main>
    </div>
  );
}

function ThemeToggle({ darkMode, onToggle }) {
  return <button type="button" className="theme-toggle" title={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} aria-pressed={darkMode} onClick={onToggle}><span aria-hidden="true">{darkMode ? '☀' : '☾'}</span></button>;
}

function BrandLogo({ href }) {
  const content = <><img className="brand-image" src={logoImage} alt="" /><span className="brand-wordmark">Evangelion of Gamers</span></>;
  return href ? <a className="brand" href={href}>{content}</a> : <div className="brand">{content}</div>;
}

function SiteSocialLinks() {
  return <nav className="site-social-links" aria-label="Redes y portfolio">
    {SOCIAL_LINKS.map((link) => <a key={link.name} className={link.url ? 'site-social-link' : 'site-social-link site-social-link-disabled'} href={link.url || undefined} target={link.url ? '_blank' : undefined} rel={link.url ? 'noopener noreferrer' : undefined} aria-label={link.name} aria-disabled={!link.url} title={link.url ? link.name : `Configura ${link.setting} para añadir tu enlace`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{link.icon === 'linkedin' ? <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.369 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> : link.icon === 'github' ? <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.87 10.95.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.35-3.88-1.35-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.2 1.17.93-.26 1.93-.39 2.92-.39.99 0 1.99.13 2.92.39 2.22-1.48 3.2-1.17 3.2-1.17.63 1.57.23 2.73.11 3.02.75.8 1.2 1.82 1.2 3.07 0 4.41-2.7 5.38-5.27 5.66.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" /> : <><rect x="3" y="7" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>}</svg>
    </a>)}
  </nav>;
}

function GameSignals({ game }) {
  if (!game) return null;
  const signals = [
    game.rating ? `Nota ${game.rating}/10` : '',
    game.platinum ? 'Platino' : '',
    game.replayed ? 'Rejugado' : '',
    game.recommended ? 'Recomendado' : ''
  ].filter(Boolean);
  return <div className="game-signals">{signals.map((signal) => <span key={signal}>{signal}</span>)}{game.notes && <small>{game.notes}</small>}</div>;
}

function CommunityLanding({ lists, loading, error, authenticated = false, darkMode, onToggleTheme, libraryIds = new Set(), libraryGames = new Map(), addingGameId = '', actionMessage = '', onClearMessage, onAddGame, onLogin, onRegister, onBack, latestNews = [], newsLoading = false, spotlight }) {
  const [newsIndex, setNewsIndex] = useState(0);
  const [newsTransitioning, setNewsTransitioning] = useState(false);
  const newsTransitionTimer = useRef(null);
  const newsChangeLock = useRef(false);
  const newsIndexRef = useRef(0);
  const activeNewsIdRef = useRef('');
  const activeNews = latestNews[newsIndex] ?? null;
  const awardNews = latestNews.filter((entry) => /the game awards|game awards|nominad|nominat/i.test(`${entry.title} ${entry.description}`)).slice(0, 3);
  const awardYear = new Date().getFullYear();

  useEffect(() => {
    if (!latestNews.length) return;
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
        {loading ? <div className="community-empty">Cargando listas…</div> : error ? <div className="community-empty" role="alert">{error}</div> : !lists.length ? <div className="community-empty"><span className="empty-glyph">☷</span><h3>Aún no hay listas compartidas.</h3><p>{authenticated ? 'Vuelve a tu espacio y crea la primera lista.' : 'Crea una cuenta para empezar la primera.'}</p>{authenticated ? <button className="button button-dark" onClick={onBack}>Mi biblioteca <span>↗</span></button> : <button className="button button-dark" onClick={onRegister}>Crear cuenta <span>↗</span></button>}</div> : <div className="community-list-grid">{lists.map((list) => {
          const covers = new Map((list.covers ?? []).map((cover) => [cover.rawgId, cover.backgroundImage]));
          return <article className="community-list-card" key={list.id}>
            <header className="community-list-heading"><div className="community-list-author"><span className="community-avatar">{list.profileImage ? <img src={list.profileImage} alt={`Foto de ${list.username}`} loading="lazy" /> : list.username?.[0]?.toUpperCase() || 'J'}</span><div><span>@{list.username || 'jugador'} · LISTA COMPARTIDA{list.year ? ` · ${list.year}` : ''}</span><h3>{list.title}</h3></div></div><div className="community-list-updated"><span>ACTUALIZADA</span><time dateTime={list.updatedAt}>{formatListDate(list.updatedAt)}</time></div></header>
            <div className="community-section-grid">{list.sections.map((section, sectionIndex) => <section className="community-category" key={`${list.id}-${sectionIndex}`}><h4><span>{section.icon || '🎮'}</span>{section.name}</h4>{section.items.length ? <ol>{section.items.map((item, itemIndex) => { const cover = item.rawgId ? covers.get(item.rawgId) : null; const inLibrary = item.rawgId ? libraryIds.has(item.rawgId) : false; return <li className="community-game-row" key={`${item.rawgId || item.title}-${itemIndex}`}><span className="community-game-number">{String(itemIndex + 1).padStart(2, '0')}</span>{cover ? <img src={cover} alt={`Portada de ${item.title}`} loading="lazy" /> : <span className="community-cover-fallback">{item.title.slice(0, 1)}</span>}<div><strong>{item.title}</strong>{item.note && <small>{item.note}</small>}<GameSignals game={item.gameMeta ?? libraryGames.get(item.rawgId)} />{authenticated && item.rawgId && <button className="community-add-button" disabled={inLibrary || addingGameId === item.rawgId} onClick={() => onAddGame(item, cover)}>{inLibrary ? 'En mi biblioteca' : addingGameId === item.rawgId ? 'Añadiendo…' : '＋ Añadir a mi biblioteca'}</button>}</div></li>; })}</ol> : <p className="community-category-empty">Sin juegos todavía.</p>}</section>)}</div>
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

function GameCover({ game, large = false }) {
  return game.backgroundImage
    ? <img className={large ? 'game-cover game-cover-large' : 'game-cover'} src={game.backgroundImage} alt={`Portada de ${game.name}`} loading="lazy" />
    : <div className={large ? 'game-cover game-cover-large cover-fallback' : 'game-cover cover-fallback'} aria-label={`Sin imagen para ${game.name}`}><span>{game.name?.slice(0, 1)}</span></div>;
}

function AchievementsPanel({ data }) {
  if (!data || data.loading) return <div className="achievements-panel">Cargando logros…</div>;
  if (data.error) return <div className="achievements-panel">{data.error}</div>;
  if (!data.results.length) return <div className="achievements-panel">RAWG no tiene logros registrados para este juego.</div>;
  return <div className="achievements-panel"><span className="achievements-title">LOGROS DE LA COMUNIDAD · {data.results.length}</span>{data.results.map((achievement) => <div className="achievement-row" key={achievement.id}><span className="achievement-icon">✧</span><div><strong>{achievement.name}</strong><p>{achievement.description || 'Logro de la comunidad'}</p></div><span className="achievement-percent">{achievement.percent}%</span></div>)}</div>;
}

export default App;
