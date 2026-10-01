export const SESSION_KEY = 'savepoint-session';
export const THEME_KEY = 'savepoint-theme';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: import.meta.env.VITE_LINKEDIN_URL, setting: 'VITE_LINKEDIN_URL', icon: 'linkedin' },
  { name: 'Portfolio', url: import.meta.env.VITE_PORTFOLIO_URL, setting: 'VITE_PORTFOLIO_URL', icon: 'portfolio' },
  { name: 'GitHub', url: import.meta.env.VITE_GITHUB_URL, setting: 'VITE_GITHUB_URL', icon: 'github' }
];

export const FEATURED_ARTWORKS = [
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

export const FILTERS = ['Todos', 'Pendiente', 'Jugando', 'Completado', 'Abandonado'];

export const STARTER_SECTIONS = [
  { name: 'Completados', icon: '🏆', items: [] },
  { name: 'Rejugados', icon: '🔁', items: [] },
  { name: 'En proceso / con intención de completarlos', icon: '⏳', items: [] },
  { name: 'Abandonados (de momento)', icon: '💤', items: [] }
];
