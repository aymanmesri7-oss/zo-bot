const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits, REST, Routes,
  SlashCommandBuilder, AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GMS_API_KEY = process.env.GMS_API_KEY;
const GMS_API_BASE = process.env.GMS_API_BASE || 'https://api.getmysocial.com';
const GUILD_ID = process.env.GUILD_ID || '1559835788911583232';
const LEADERBOARD_CHANNEL_ID = process.env.LEADERBOARD_CHANNEL_ID || '1559970786398175252';
const ANNOUNCEMENT_CHANNEL_ID = process.env.ANNOUNCEMENT_CHANNEL_ID || '1559840179609534474';
const CLICKS_CHANNEL_ID = process.env.CLICKS_CHANNEL_ID; // salon pour le bouton "voir mes clics"
const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 min
const DATA_FILE = path.join(__dirname, 'data.json');

// ─── Rôles Money / Mafia / Démons / Dieux (paliers) ─────────
const ROLES = [
  { clicks: 5,    name: '💵 Affamé',                color: 0x95A5A6 },
  { clicks: 10,   name: '🦈 Requin',                color: 0x7F8C8D },
  { clicks: 15,   name: '🐺 Loup de Wall Street',   color: 0x3498DB },
  { clicks: 20,   name: '💰 Baron du Cash',         color: 0x2980B9 },
  { clicks: 25,   name: '🚬 Scarface',              color: 0xE67E22 },
  { clicks: 30,   name: '🌹 Le Parrain',            color: 0x8B0000 },
  { clicks: 50,   name: '👑 El Patrón',             color: 0xFFD700 },
  { clicks: 75,   name: '💎 L\'Intouchable',        color: 0xE8DAEF },
  { clicks: 100,  name: '😈 Démon Alpha',           color: 0xE74C3C },
  { clicks: 125,  name: '🔥 Démon Infernal',        color: 0xD35400 },
  { clicks: 150,  name: '👹 Archidémon',            color: 0xC0392B },
  { clicks: 175,  name: '💀 Faucheur',              color: 0x2C3E50 },
  { clicks: 200,  name: '⚔️ Faucheur d\'Âmes',      color: 0x1A1A2E },
  { clicks: 225,  name: '🕷️ Seigneur des Ombres',   color: 0x4A235A },
  { clicks: 250,  name: '🦇 Prince des Ténèbres',   color: 0x6C3483 },
  { clicks: 275,  name: '🔥 Seigneur des Enfers',   color: 0xE74C3C },
  { clicks: 300,  name: '😈 Satan',                 color: 0x8B0000 },
  { clicks: 325,  name: '🪽 Lucifer',               color: 0xF1C40F },
  { clicks: 350,  name: '⛓️ Briseur de Titans',     color: 0x7F8C8D },
  { clicks: 375,  name: '🗿 Titan',                 color: 0x5D6D7E },
  { clicks: 400,  name: '🌋 Titan Infernal',        color: 0xE74C3C },
  { clicks: 425,  name: '⚡ Titan Primordial',      color: 0xF39C12 },
  { clicks: 450,  name: '🐉 Dragon de l\'Apocalypse', color: 0x27AE60 },
  { clicks: 475,  name: '☄️ Destructeur de Mondes',  color: 0xD35400 },
  { clicks: 500,  name: '🌌 Dévoreur de Mondes',    color: 0x1A5276 },
  { clicks: 525,  name: '🩸 Fléau des Dieux',       color: 0xC0392B },
  { clicks: 550,  name: '⚔️ Tueur de Dieux',        color: 0xE74C3C },
  { clicks: 575,  name: '💀 Dévoreur de Dieux',     color: 0x2C3E50 },
  { clicks: 600,  name: '🔥 Dieu de la Destruction', color: 0x8E44AD },
  { clicks: 625,  name: '🌪️ Dieu du Chaos',         color: 0x9B59B6 },
  { clicks: 650,  name: '🌑 Dieu des Abysses',      color: 0x1A1A2E },
  { clicks: 675,  name: '🔱 Dieu Suprême',          color: 0xFFD700 },
  { clicks: 700,  name: '👑 Roi des Dieux',         color: 0xFFD700 },
  { clicks: 725,  name: '⚜️ Empereur Divin',        color: 0xD4AC0D },
  { clicks: 750,  name: '🖤 Maître du Néant',       color: 0x17202A },
  { clicks: 775,  name: '🌀 Dévoreur de Réalités',  color: 0x8E44AD },
  { clicks: 800,  name: '⌛ Briseur du Temps',      color: 0x1ABC9C },
  { clicks: 825,  name: '🌌 Souverain des Dimensions', color: 0x5B2C6F },
  { clicks: 850,  name: '✨ Entité Primordiale',    color: 0xE8DAEF },
  { clicks: 875,  name: '🔮 Architecte du Destin',  color: 0x6C3483 },
  { clicks: 900,  name: '💥 Maître de l\'Apocalypse', color: 0xE74C3C },
  { clicks: 925,  name: '♾️ Souverain de l\'Infini', color: 0x00CED1 },
  { clicks: 950,  name: '🛐 L\'Omnipotent',         color: 0xF4D03F },
  { clicks: 975,  name: '🖤 L\'Éternel',            color: 0x17202A },
  { clicks: 1000, name: '♾️ L\'Absolu',              color: 0xFF0000 },
];

// Rôles top 3
const TOP_ROLES = [
  { rank: 1, name: '🥇 Le Tout-Puissant', color: 0xFFD700 },
  { rank: 2, name: '🥈 Le Souverain',     color: 0xC0C0C0 },
  { rank: 3, name: '🥉 Le Conquérant',    color: 0xCD7F32 },
];

// ─── Citations motivantes Money / Hustle ─────────────────────
const QUOTES = [
  { text: "L'argent ne dort jamais. Toi non plus.", author: "Zoé 💖" },
  { text: "Pendant que tu dors, quelqu'un d'autre empile.", author: "Zoé 💖" },
  { text: "Les excuses ne paient pas les factures. Les clics, oui.", author: "Zoé 💖" },
  { text: "Tu veux vivre comme un boss ? Grind comme un boss.", author: "Zoé 💖" },
  { text: "Le top 10 c'est pas un rêve, c'est une décision.", author: "Zoé 💖" },
  { text: "La différence entre toi et le top 1 ? Juste quelques clics.", author: "Zoé 💖" },
  { text: "Deviens riche ou meurs en cliquant.", author: "Zoé 💖" },
  { text: "Ce mois-ci, c'est TON mois. Prends ce qui est à toi.", author: "Zoé 💖" },
  { text: "On ne compte pas les heures, on compte les billets.", author: "Zoé 💖" },
  { text: "Tout le monde veut le lifestyle. Personne veut le grind.", author: "Zoé 💖" },
  { text: "J'ai pas eu de la chance. Je l'ai mérité.", author: "Scarface" },
  { text: "Le monde est à toi.", author: "Tony Montana" },
  { text: "D'abord tu prends l'argent, ensuite tu prends le pouvoir.", author: "Tony Montana" },
  { text: "Défonce-toi pas avec ta propre came. Défonce-toi avec ton hustle.", author: "Zoé 💖" },
  { text: "L'argent parle. Le reste, c'est du vent.", author: "El Patrón" },
  { text: "Un patron ne demande pas la permission. Il prend.", author: "Zoé 💖" },
  { text: "Les faibles comptent les jours. Les boss comptent les clics.", author: "Zoé 💖" },
  { text: "Soit tu bosses pour tes rêves, soit tu bosses pour ceux d'un autre.", author: "Zoé 💖" },
  { text: "La rue ne pardonne pas aux fainéants.", author: "El Patrón" },
  { text: "Chaque clic, c'est un billet de plus dans ta poche.", author: "Zoé 💖" },
];

// GIFs par palier — fichiers locaux dans ./gifs/
const GIF_DIR = path.join(__dirname, 'gifs');

const TIER_GIFS = {
  // 5-20: Hustle / Money
  hustle: [
    'money.gif', 'money-1.gif', 'franklin-saint.gif', 'franklin-saint-walking-franklin-saint.gif',
    'made-by-auf.gif', 'mrlinemoverrr.gif', 'ad-laurent.gif',
  ],
  // 25-50: Mafia / Boss / Gangster
  mafia: [
    'mafia-boss.gif', 'leo-angry-wolf.gif', 'oppenheimer-oppenheimer-movie.gif',
    'war-dogs-war-dogs-movie.gif', 'war-dogs-war-dogs-movie-1.gif', 'war-dogs-war-dogs-movie-2.gif',
    'efraim-war-dogs.gif', 'gngsta.gif', 'pablo-vibes.gif', 'keyvon-crawford-kilo-tray-ballas.gif',
    'cj-cj-gta.gif', 'gta-grand-theft-auto.gif', 'di-caprio-moi.gif', 'leonardo-dicaprio-laughing.gif',
  ],
  // 75: Empire / Luxe / Succès
  empire: [
    'd9luxe.gif', 'd9luxe-1.gif', 'd9luxe-2.gif', 'd9luxe-3.gif',
    'elon-musk-dance.gif', 'elon-musk-tesla.gif', 'elon-musk-this-is.gif', 'titanic-titanic-movie.gif',
  ],
  // 100-225: Anime Power / Démons
  power: [
    'goku-mad.gif', 'gohan-beast-gohan.gif', 'goku-dragon-ball-z.gif',
    'lf-ssjb-goku-grn-ssjb-goku.gif', 'naruto-naruto-uzumaki.gif', 'naruto.gif', 'dokkan-battle-top.gif',
  ],
  // Célébration — mixé dans tous les paliers
  celebration: [
    'dance.gif', 'cat-dance.gif', 'cat-cat-dance.gif', 'jiggy-kid-dancing.gif',
    'mayombo-dancing.gif', 'mayombo-dancing-1.gif', 'mec-qui-danse-homme-danse.gif',
    'dance-dance-dance-cute.gif', 'worm-bean-boy-benjamin-doing-the-worm-dance-dancing.gif',
    'benin.gif', 'benin-benin-silent.gif', 'benin-football.gif', 'steve-mounié-mounie.gif',
    'madagascar-madagascar-scream.gif', 'flag-national.gif',
    'clapping.gif', 'great-thumbs-up.gif', 'dab-me-up-generation-dab.gif', 'dap-handshake.gif',
    'one-piece-dab-me-up.gif', 'thats-it-yes-thats-it.gif', 'cool-fun.gif',
    'cat-ai.gif', 'rio-scuba.gif', 'scuba-scuba-cat.gif', 'giggitygoooo.gif',
    'made-by-aur.gif', 'sticker-fortiktok.gif', 'triplet-tung-tung-tung-sahur.gif',
    'trash-vegan-comedy.gif', 'calculating-alan.gif', 'elon-musk-dance.gif',
  ],
  // Top 3: les plus gros GIFs
  top: [
    'd9luxe-1.gif', 'goku-dragon-ball-z.gif', 'lf-ssjb-goku-grn-ssjb-goku.gif',
    'dokkan-battle-top.gif', 'gohan-beast-gohan.gif', 'jiggy-kid-dancing.gif',
    'mayombo-dancing.gif', 'elon-musk-tesla.gif',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────
function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
function randomGif(clicks) {
  // Pick from tier + celebration pool (50/50 chance)
  let tier;
  if (clicks == null)         tier = 'hustle';
  else if (clicks < 25)       tier = 'hustle';
  else if (clicks < 75)       tier = 'mafia';
  else if (clicks < 100)      tier = 'empire';
  else                        tier = 'power';
  // 50% chance to use celebration GIF instead
  const useCelebration = Math.random() < 0.5;
  const pool = useCelebration ? TIER_GIFS.celebration : TIER_GIFS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
function randomGifTop() {
  const pool = TIER_GIFS.top;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Load a local GIF file → AttachmentBuilder
function loadGifAttachment(filename, attachName = 'promo.gif') {
  try {
    const filePath = path.join(GIF_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`⚠️ GIF introuvable: ${filePath}`);
      return null;
    }
    return new AttachmentBuilder(filePath, { name: attachName });
  } catch (e) {
    console.error(`⚠️ GIF load failed (${filename}):`, e.message);
    return null;
  }
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { resetDate: null, leaderboardMessageId: null, clicksMessageId: null, roleCache: {}, top1VA: null };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function progressBar(current, max, length = 20) {
  const filled = Math.round((current / Math.max(max, 1)) * length);
  const empty = length - filled;
  return '▓'.repeat(Math.min(filled, length)) + '░'.repeat(Math.max(empty, 0));
}

function getRoleForClicks(clicks) {
  let role = null;
  for (const r of ROLES) {
    if (clicks >= r.clicks) role = r;
  }
  return role;
}

function getNextRole(clicks) {
  for (const r of ROLES) {
    if (clicks < r.clicks) return r;
  }
  return null;
}

// ─── GetMySocial API ─────────────────────────────────────────
async function gmsRequest(endpoint, params = {}) {
  const url = new URL(`${GMS_API_BASE}/v3/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${GMS_API_KEY}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GMS API ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllLinks() {
  const links = [];
  let cursor = undefined;
  do {
    const res = await gmsRequest('links', { limit: 100, cursor });
    links.push(...res.data);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return links;
}

async function fetchMetrics() {
  // allTime — c'est le boss qui décide quand on reset
  const params = { sort: '-button_clicks', limit: 100, timeframe: 'allTime' };

  const metrics = [];
  let cursor = undefined;
  do {
    const p = { ...params };
    if (cursor) p.cursor = cursor;
    const res = await gmsRequest('analytics/links', p);
    metrics.push(...res.data);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return metrics;
}

// Clics à soustraire du allTime pour certains VAs
// mampionona avait 1767 clics avant le 10 oct 2026, on les ignore
const VA_CLICK_OFFSET = {
  'mampionona1993': 1767,
};

// Agréger clics par VA (display_name)
function aggregateByVA(links, metrics) {
  const linkToVA = {};
  for (const link of links) {
    linkToVA[link.id] = link.display_name;
  }

  const vaClicks = {};
  for (const m of metrics) {
    const va = linkToVA[m.key];
    if (!va) continue;
    vaClicks[va] = (vaClicks[va] || 0) + (m.button_clicks || 0);
  }

  // Soustraire les clics avant la date de début pour certains VAs
  for (const [va, offset] of Object.entries(VA_CLICK_OFFSET)) {
    if (vaClicks[va] !== undefined) {
      vaClicks[va] = Math.max(0, vaClicks[va] - offset);
    }
  }

  return Object.entries(vaClicks)
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

// ─── Discord Bot ─────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ]
});

let cachedLinks = [];
let cachedRanking = [];

// ─── Build leaderboard embed ─────────────────────────────────
function buildLeaderboardEmbeds(ranking) {
  const quote = randomQuote();
  const top10 = ranking.slice(0, 10);
  const topClicks = top10[0]?.clicks || 1;
  const data = loadData();
  const resetDate = data.resetDate ? new Date(data.resetDate) : null;
  const daysElapsed = resetDate
    ? Math.max(1, Math.ceil((Date.now() - resetDate.getTime()) / 86400000))
    : 14;

  const medals = ['🥇', '🥈', '🥉'];
  const rankEmojis = ['🔥', '⚡', '💪', '✨', '💎', '🌟', '⭐'];

  let desc = '';
  desc += '```\n';
  desc += '╔══════════════════════════════════════╗\n';
  desc += '║    💰 CLASSEMENT DE L\'EMPIRE 💰      ║\n';
  desc += '╚══════════════════════════════════════╝\n';
  desc += '```\n\n';

  if (top10.length === 0) {
    desc += '> Aucun clic enregistré pour cette période.\n';
    desc += '> *Les rues sont vides... qui ose grind ?*\n';
  }

  for (let i = 0; i < top10.length; i++) {
    const va = top10[i];
    const medal = medals[i] || `**${i + 1}.**`;
    const emoji = rankEmojis[i] || '▸';
    const bar = progressBar(va.clicks, topClicks, 15);
    const role = getRoleForClicks(va.clicks);
    const roleName = role ? role.name : 'Pas encore de rang';

    desc += `${medal} **${va.name}** — **${va.clicks}** clics ${emoji}\n`;
    desc += `┃ ${bar} ${roleName}\n\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle('💰 L\'EMPIRE — TOP 10 CLICS')
    .setDescription(desc)
    .setColor(0xFFD700)
    .setFooter({
      text: `💬 "${quote.text}" — ${quote.author}`,
    })
    .setTimestamp();

  embed.addFields({
    name: '📅 Période',
    value: '♾️ **Depuis le début**',
    inline: true,
  });

  // Second embed with motivation
  const motivEmbed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setDescription('> 💰 **Chaque clic, c\'est un billet de plus. Chaque effort te rapproche du trône.**\n> *Les vrais patrons n\'abandonnent jamais !*');

  return [embed, motivEmbed];
}

// ─── Build individual stats embed ────────────────────────────
function buildStatsEmbed(username, ranking) {
  const quote = randomQuote();
  const data = loadData();
  const resetDate = data.resetDate ? new Date(data.resetDate) : null;
  const daysElapsed = resetDate
    ? Math.max(1, Math.ceil((Date.now() - resetDate.getTime()) / 86400000))
    : 14;

  // Find user in ranking (case-insensitive match on Discord username)
  const userLower = username.toLowerCase();
  const idx = ranking.findIndex(r => r.name.toLowerCase() === userLower);

  if (idx === -1) {
    return new EmbedBuilder()
      .setTitle('❌ Aucun lien trouvé')
      .setDescription(
        `Je ne trouve pas de lien GetMySocial pour **${username}**.\n\n` +
        `Ton pseudo Discord doit être le même que ton nom sur GetMySocial.\n` +
        `Contacte un admin si c'est pas le cas.`
      )
      .setColor(0xFF0000);
  }

  const va = ranking[idx];
  const position = idx + 1;
  const total = ranking.length;
  const avg = (va.clicks / daysElapsed).toFixed(1);
  const currentRole = getRoleForClicks(va.clicks);
  const nextRole = getNextRole(va.clicks);
  const roleName = currentRole ? currentRole.name : 'Pas encore de rang';

  let desc = '';
  desc += `## 📊 Tes stats, ${va.name} !\n\n`;
  desc += `🔢 **Clics total** : **${va.clicks}**\n`;
  desc += `📈 **Moyenne/jour** : **${avg}** clics\n`;
  desc += `🏅 **Rang** : ${roleName}\n`;
  desc += `📍 **Position** : **#${position}** sur ${total}\n\n`;

  if (nextRole) {
    const remaining = nextRole.clicks - va.clicks;
    const progress = progressBar(va.clicks, nextRole.clicks, 20);
    desc += `${progress}\n`;
    desc += `➡️ Prochain rang : **${nextRole.name}** (${nextRole.clicks} clics) — encore **${remaining}** clics !\n\n`;
  } else {
    desc += `♾️ **Tu as atteint le rang ultime ! L'Absolu !**\n\n`;
  }

  // Motivation based on position
  if (position <= 3) {
    desc += `> 🔥 **Tu es dans le TOP 3 ! Tu domines l'empire !**`;
  } else if (position <= 10) {
    desc += `> ⚡ **Top 10 ! Tu es un vrai boss. Pousse encore pour le trône !**`;
  } else {
    const top10Clicks = ranking[9]?.clicks || 0;
    const gap = top10Clicks - va.clicks;
    desc += `> 💪 **Encore ${gap} clics pour entrer dans le Top 10 ! Grind plus fort !**`;
  }

  const embed = new EmbedBuilder()
    .setTitle(`💰 Statistiques de ${va.name}`)
    .setDescription(desc)
    .setColor(currentRole?.color || 0x5865F2)
    .setFooter({ text: `💬 "${quote.text}" — ${quote.author}` })
    .setTimestamp();

  return embed;
}

// ─── Role management ─────────────────────────────────────────
async function ensureRolesExist(guild) {
  const existingRoles = guild.roles.cache;

  for (const r of [...ROLES, ...TOP_ROLES.map(t => ({ name: t.name, color: t.color }))]) {
    const existing = existingRoles.find(er => er.name === r.name);
    if (!existing) {
      try {
        await guild.roles.create({
          name: r.name,
          color: r.color,
          hoist: true,
          reason: 'Zoé Bot - Rôle Money auto',
        });
        console.log(`✅ Rôle créé: ${r.name}`);
      } catch (e) {
        console.error(`❌ Impossible de créer le rôle ${r.name}:`, e.message);
      }
    } else if (!existing.hoist) {
      try {
        await existing.setHoist(true, 'Zoé Bot - Afficher séparément');
      } catch (e) {
        console.error(`⚠️ Impossible de hoist ${r.name}:`, e.message);
      }
    }
  }

  // ── Ordonner les rôles : plus de clics = plus haut dans la hiérarchie ──
  try {
    await guild.roles.fetch(); // refresh cache
    const botMember = await guild.members.fetchMe();
    const botHighestPos = botMember.roles.highest.position;

    // Tous les rôles du bot triés par clics (ascending) → position ascending
    const allBotRoles = [
      ...ROLES.map(r => ({ name: r.name, order: r.clicks })),
      ...TOP_ROLES.map(t => ({ name: t.name, order: 10000 + (4 - t.rank) })), // top1 = 10003, top2 = 10002, top3 = 10001
    ];
    allBotRoles.sort((a, b) => a.order - b.order); // lowest clicks first = lowest position

    const positions = [];
    // Start at position 1 (just above @everyone which is 0)
    for (let i = 0; i < allBotRoles.length; i++) {
      const role = guild.roles.cache.find(r => r.name === allBotRoles[i].name);
      if (role && role.position < botHighestPos) {
        positions.push({ role: role.id, position: i + 1 });
      }
    }

    if (positions.length > 0) {
      await guild.roles.setPositions(positions);
      console.log(`✅ ${positions.length} rôles réordonnés`);
    }
  } catch (e) {
    console.error('⚠️ Impossible de réordonner les rôles:', e.message);
  }
}

async function updateRoles(guild, ranking) {
  const data = loadData();
  const announceChannel = guild.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
  const allRoleNames = ROLES.map(r => r.name);
  const topRoleNames = TOP_ROLES.map(r => r.name);

  // ponytail: O(n*m) lookup, fine for ~30 VAs and ~15 roles
  for (let i = 0; i < ranking.length; i++) {
    const va = ranking[i];
    const targetRole = getRoleForClicks(va.clicks);
    if (!targetRole) continue;

    // Find Discord member by username (case-insensitive)
    let member;
    try {
      const members = await guild.members.fetch({ query: va.name, limit: 5 });
      member = members.find(m =>
        m.user.username.toLowerCase() === va.name.toLowerCase() ||
        m.displayName.toLowerCase() === va.name.toLowerCase()
      );
    } catch { continue; }
    if (!member) continue;

    // Current role in the hierarchy
    const previousRoleName = data.roleCache?.[va.name];

    // Assign new click role, remove old ones
    const guildRoles = guild.roles.cache;
    const targetGuildRole = guildRoles.find(r => r.name === targetRole.name);
    if (!targetGuildRole) continue;

    // Remove all other click roles
    const rolesToRemove = member.roles.cache.filter(
      r => allRoleNames.includes(r.name) && r.name !== targetRole.name
    );
    for (const [, role] of rolesToRemove) {
      try { await member.roles.remove(role); } catch {}
    }

    // Add new role if not already assigned
    if (!member.roles.cache.has(targetGuildRole.id)) {
      try {
        await member.roles.add(targetGuildRole);
      } catch (e) {
        console.error(`Impossible d'ajouter le rôle ${targetRole.name} à ${va.name}:`, e.message);
        continue;
      }
    }

    // Announce promotion if role changed (séparé de l'assignation)
    if (previousRoleName !== targetRole.name) {
      console.log(`🎉 Promotion: ${va.name} → ${targetRole.name} (avant: ${previousRoleName || 'aucun'})`);

      const gifFile = randomGif(va.clicks);
      const gifAttachment = loadGifAttachment(gifFile);

      // ─── Annonce dans #discussion ───
      if (announceChannel) {
        const quote = randomQuote();
        const promoEmbed = new EmbedBuilder()
          .setTitle('🔥🔥🔥  PROMOTION  🔥🔥🔥')
          .setDescription(
            `# 💰💰💰\n\n` +
            `${member} EST MAINTENANT\n\n` +
            `## ✨ ${targetRole.name.toUpperCase()} ✨\n\n` +
            `**${va.clicks}+ CLICS** 🏆🏆🏆\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `> 💬 *"${quote.text}"*\n> — ${quote.author}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🔥🔥 QUI SERA LE PROCHAIN À MONTER DANS L'EMPIRE ? 🔥🔥`
          )
          .setColor(targetRole.color)
          .setTimestamp();
        if (gifAttachment) promoEmbed.setImage('attachment://promo.gif');

        try {
          const sendOpts = { embeds: [promoEmbed] };
          if (gifAttachment) sendOpts.files = [gifAttachment];
          await announceChannel.send(sendOpts);
          console.log(`✅ Annonce envoyée dans #${announceChannel.name}`);
        } catch (e) {
          console.error('❌ Erreur envoi annonce:', e.message);
        }
      } else {
        console.error(`❌ Salon annonce introuvable (ID: ${ANNOUNCEMENT_CHANNEL_ID})`);
      }

      // Petit délai entre chaque annonce pour pas tout envoyer d'un coup
      await new Promise(r => setTimeout(r, 3000));
    }

    // Update cache
    if (!data.roleCache) data.roleCache = {};
    data.roleCache[va.name] = targetRole.name;

    // ─── Top 1/2/3 roles + annonce spéciale #1 ───
    const previousTop1 = data.top1VA;
    for (const top of TOP_ROLES) {
      const topGuildRole = guildRoles.find(r => r.name === top.name);
      if (!topGuildRole) continue;

      if (i + 1 === top.rank) {
        if (!member.roles.cache.has(topGuildRole.id)) {
          try { await member.roles.add(topGuildRole); } catch {}
        }
        // Annonce spéciale quand quelqu'un prend la tête (#1)
        if (top.rank === 1 && previousTop1 !== va.name && announceChannel) {
          const top1Embed = new EmbedBuilder()
            .setTitle('👑👑👑  NOUVEAU NUMÉRO 1  👑👑👑')
            .setDescription(
              `# 🏆🏆🏆\n\n` +
              `🔥🔥 ${member} PREND LA\n\n` +
              `## ✨ PREMIÈRE PLACE ✨\n\n` +
              `AVEC **${va.clicks} CLICS** !!!\n\n` +
              `C'EST LE NOUVEAU **${top.name.toUpperCase()}** DU SERVEUR !\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `💪💪 QUI VA LE DÉTRÔNER ? LE GRIND CONTINUE... 💪💪`
            )
            .setColor(0xFFD700)
            .setTimestamp();

          try {
            const top1Gif = loadGifAttachment(randomGifTop(), 'top1.gif');
            if (top1Gif) top1Embed.setImage('attachment://top1.gif');
            const top1Opts = { embeds: [top1Embed] };
            if (top1Gif) top1Opts.files = [top1Gif];
            await announceChannel.send(top1Opts);
            console.log(`👑 Annonce #1 envoyée pour ${va.name}`);
          } catch (e) {
            console.error('❌ Erreur annonce #1:', e.message);
          }
          data.top1VA = va.name;
        }
      } else {
        if (member.roles.cache.has(topGuildRole.id)) {
          try { await member.roles.remove(topGuildRole); } catch {}
        }
      }
    }
  }

  saveData(data);
}

// ─── Update cycle ────────────────────────────────────────────
async function updateLeaderboard() {
  try {
    console.log('🔄 Mise à jour du leaderboard...');
    const data = loadData();

    // Fetch fresh data from GMS
    cachedLinks = await fetchAllLinks();
    const metrics = await fetchMetrics();
    cachedRanking = aggregateByVA(cachedLinks, metrics);

    console.log(`📊 ${cachedRanking.length} VAs trouvés, top: ${cachedRanking[0]?.name} (${cachedRanking[0]?.clicks} clics)`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Serveur non trouvé:', GUILD_ID);
      return;
    }

    // Update leaderboard channel — use saved channel from /setupleaderboard, fallback to config
    const lbChannelId = data.leaderboardChannelId || LEADERBOARD_CHANNEL_ID;
    let lbChannel = guild.channels.cache.get(lbChannelId);
    if (!lbChannel) {
      try { lbChannel = await guild.channels.fetch(lbChannelId); } catch {}
    }
    if (lbChannel) {
      console.log(`📋 Mise à jour leaderboard dans #${lbChannel.name} (${lbChannelId})`);
      const embeds = buildLeaderboardEmbeds(cachedRanking);

      let sent = false;
      if (data.leaderboardMessageId) {
        try {
          const msg = await lbChannel.messages.fetch(data.leaderboardMessageId);
          await msg.edit({ embeds });
          console.log(`✏️ Leaderboard édité (msg ${data.leaderboardMessageId})`);
          sent = true;
        } catch (e) {
          console.log(`⚠️ Ancien message introuvable (${data.leaderboardMessageId}), envoi nouveau...`);
          data.leaderboardMessageId = null;
        }
      }
      if (!sent) {
        try {
          const msg = await lbChannel.send({ embeds });
          data.leaderboardMessageId = msg.id;
          saveData(data);
          console.log(`✅ Nouveau leaderboard envoyé (msg ${msg.id})`);
        } catch (e) {
          console.error(`❌ Impossible d'envoyer le leaderboard:`, e.message);
        }
      }
    } else {
      console.log(`⏳ Leaderboard pas encore configuré — utilise /setupleaderboard dans un salon`);
    }

    // Update roles
    await ensureRolesExist(guild);
    await updateRoles(guild, cachedRanking);

    // Setup clicks button if channel configured
    if (CLICKS_CHANNEL_ID) {
      const clicksChannel = guild.channels.cache.get(CLICKS_CHANNEL_ID);
      if (clicksChannel) {
        const buttonEmbed = new EmbedBuilder()
          .setTitle('📊 Voir tes clics')
          .setDescription(
            '> Clique sur le bouton ci-dessous pour voir tes stats personnelles !\n\n' +
            '> 🔢 **Total de clics** · 📈 **Moyenne/jour** · 🏅 **Ton rang** · 📍 **Ta position**'
          )
          .setColor(0x5865F2);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('view_clicks')
            .setLabel('👀 Voir mes clics')
            .setStyle(ButtonStyle.Primary)
        );

        if (data.clicksMessageId) {
          try {
            const msg = await clicksChannel.messages.fetch(data.clicksMessageId);
            await msg.edit({ embeds: [buttonEmbed], components: [row] });
          } catch {
            const msg = await clicksChannel.send({ embeds: [buttonEmbed], components: [row] });
            data.clicksMessageId = msg.id;
            saveData(data);
          }
        } else {
          const msg = await clicksChannel.send({ embeds: [buttonEmbed], components: [row] });
          data.clicksMessageId = msg.id;
          saveData(data);
        }
      }
    }

    console.log('✅ Leaderboard mis à jour');
  } catch (e) {
    console.error('❌ Erreur mise à jour:', e);
  }
}

// ─── Register slash commands ─────────────────────────────────
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('reset')
      .setDescription('Reset le leaderboard (nouvelle période de 2 semaines)')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName('forceleaderboard')
      .setDescription('Forcer la mise à jour du leaderboard')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Afficher le classement des clics'),
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Voir tes clics'),
    new SlashCommandBuilder()
      .setName('forceannonces')
      .setDescription('Renvoyer toutes les annonces de promotion')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName('setupclicks')
      .setDescription('Configurer le bouton "Voir mes clics" dans ce salon')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName('setupleaderboard')
      .setDescription('Installer le panneau leaderboard dans le salon #leaderboard')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ];

  const rest = new REST().setToken(DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands.map(c => c.toJSON()),
    });
    console.log('✅ Commandes slash enregistrées');
  } catch (e) {
    console.error('❌ Erreur enregistrement commandes:', e);
  }
}

// ─── Event handlers ──────────────────────────────────────────
client.once('ready', async () => {
  console.log(`💰 Zoé 💖 est en ligne ! (${client.user.tag})`);
  await registerCommands();
  await updateLeaderboard();
  setInterval(updateLeaderboard, UPDATE_INTERVAL);
});

client.on('interactionCreate', async (interaction) => {
  // Button: view clicks
  if (interaction.isButton() && interaction.customId === 'view_clicks') {
    await interaction.deferReply({ ephemeral: true });
    const username = interaction.user.username;
    const embed = buildStatsEmbed(username, cachedRanking);
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  // /stats
  if (interaction.commandName === 'stats') {
    await interaction.deferReply({ ephemeral: true });
    const username = interaction.user.username;
    const embed = buildStatsEmbed(username, cachedRanking);
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // /reset (admin only)
  if (interaction.commandName === 'reset') {
    const data = loadData();
    data.resetDate = new Date().toISOString();
    data.roleCache = {};
    saveData(data);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔄 Leaderboard Reset !')
          .setDescription(
            '**Nouvelle période de 2 semaines lancée !**\n\n' +
            '> 💸 Les compteurs repartent à zéro.\n' +
            '> 👑 Que le vrai patron se lève !\n\n' +
            `📅 Début : <t:${Math.floor(Date.now() / 1000)}:F>`
          )
          .setColor(0x2ECC71)
      ]
    });

    // Force refresh
    setTimeout(updateLeaderboard, 2000);
    return;
  }

  // /leaderboard — afficher le classement
  if (interaction.commandName === 'leaderboard') {
    await interaction.deferReply({ ephemeral: true });
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Classement mis à jour ! Va voir dans #leaderboard' });
    return;
  }

  // /forceleaderboard (admin only)
  if (interaction.commandName === 'forceleaderboard') {
    await interaction.deferReply({ ephemeral: true });
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Leaderboard mis à jour !' });
    return;
  }

  // /forceannonces (admin only) — vide le cache et renvoie toutes les annonces
  if (interaction.commandName === 'forceannonces') {
    await interaction.deferReply({ ephemeral: true });
    const data = loadData();
    data.roleCache = {};
    saveData(data);
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Toutes les annonces de promotion ont été renvoyées !' });
    return;
  }

  // /setupleaderboard (admin only) — install leaderboard panel in THIS channel
  if (interaction.commandName === 'setupleaderboard') {
    await interaction.deferReply({ ephemeral: true });
    try {
      // Fetch fresh data
      cachedLinks = await fetchAllLinks();
      const metrics = await fetchMetrics();
      cachedRanking = aggregateByVA(cachedLinks, metrics);

      const embeds = buildLeaderboardEmbeds(cachedRanking);
      // Send in the channel where the command was used
      const msg = await interaction.channel.send({ embeds });

      // Save this channel as the new leaderboard channel + message ID
      const data = loadData();
      data.leaderboardMessageId = msg.id;
      data.leaderboardChannelId = interaction.channel.id;
      saveData(data);

      await interaction.editReply({ content: '✅ Panneau leaderboard installé dans ce salon !' });
    } catch (err) {
      console.error('❌ setupleaderboard error:', err);
      await interaction.editReply({ content: `❌ Erreur: ${err.message}` });
    }
    return;
  }

  // /setupclicks (admin only) — setup the clicks button in current channel
  if (interaction.commandName === 'setupclicks') {
    const data = loadData();
    const buttonEmbed = new EmbedBuilder()
      .setTitle('📊 Voir tes clics')
      .setDescription(
        '> Clique sur le bouton ci-dessous pour voir tes stats personnelles !\n\n' +
        '> 🔢 **Total de clics** · 📈 **Moyenne/jour** · 🏅 **Ton rang** · 📍 **Ta position**\n\n' +
        '> 💰 *Chaque clic te rapproche du trône !*'
      )
      .setColor(0x5865F2);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('view_clicks')
        .setLabel('👀 Voir mes clics')
        .setStyle(ButtonStyle.Primary)
    );

    const msg = await interaction.channel.send({ embeds: [buttonEmbed], components: [row] });
    data.clicksMessageId = msg.id;
    saveData(data);

    await interaction.reply({ content: '✅ Bouton configuré !', ephemeral: true });
    return;
  }
});

// ─── Start ───────────────────────────────────────────────────
if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant !');
  process.exit(1);
}
if (!GMS_API_KEY) {
  console.error('❌ GMS_API_KEY manquant !');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
