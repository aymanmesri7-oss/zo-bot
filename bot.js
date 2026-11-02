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
const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 min

// ─── Serveurs ───
const INSTA2_GROUP_ID = 'grp_6ae499bd3475fe25ae70c812';
const SERVERS = {
  // Halo Agency : catégorie Instagram 2
  '1566540447487099041': {
    dataFile: 'data-halo.json',
    keepLink: l => l.group_id === INSTA2_GROUP_ID,
  },
  // INSTAGRAM come back : liens sans groupe (ungrouped)
  '1566758699685515285': {
    dataFile: 'data-comeback.json',
    keepLink: l => !l.group_id,
  },
};

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
  hustle: [
    'money.gif', 'money-1.gif', 'franklin-saint.gif', 'franklin-saint-walking-franklin-saint.gif',
    'made-by-auf.gif', 'mrlinemoverrr.gif', 'ad-laurent.gif',
  ],
  mafia: [
    'mafia-boss.gif', 'leo-angry-wolf.gif', 'oppenheimer-oppenheimer-movie.gif',
    'war-dogs-war-dogs-movie.gif', 'war-dogs-war-dogs-movie-1.gif', 'war-dogs-war-dogs-movie-2.gif',
    'efraim-war-dogs.gif', 'gngsta.gif', 'pablo-vibes.gif', 'keyvon-crawford-kilo-tray-ballas.gif',
    'cj-cj-gta.gif', 'gta-grand-theft-auto.gif', 'di-caprio-moi.gif', 'leonardo-dicaprio-laughing.gif',
  ],
  empire: [
    'd9luxe.gif', 'd9luxe-1.gif', 'd9luxe-2.gif', 'd9luxe-3.gif',
    'elon-musk-dance.gif', 'elon-musk-tesla.gif', 'elon-musk-this-is.gif', 'titanic-titanic-movie.gif',
  ],
  power: [
    'goku-mad.gif', 'gohan-beast-gohan.gif', 'goku-dragon-ball-z.gif',
    'lf-ssjb-goku-grn-ssjb-goku.gif', 'naruto-naruto-uzumaki.gif', 'naruto.gif', 'dokkan-battle-top.gif',
  ],
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
  let tier;
  if (clicks == null)         tier = 'hustle';
  else if (clicks < 25)       tier = 'hustle';
  else if (clicks < 75)       tier = 'mafia';
  else if (clicks < 100)      tier = 'empire';
  else                        tier = 'power';
  const useCelebration = Math.random() < 0.5;
  const pool = useCelebration ? TIER_GIFS.celebration : TIER_GIFS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
function randomGifTop() {
  const pool = TIER_GIFS.top;
  return pool[Math.floor(Math.random() * pool.length)];
}

function loadGifAttachment(filename, attachName = 'promo.gif') {
  try {
    const filePath = path.join(GIF_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return new AttachmentBuilder(filePath, { name: attachName });
  } catch { return null; }
}

function dataPath(guildId) {
  return path.join(__dirname, SERVERS[guildId].dataFile);
}

function loadData(guildId) {
  try {
    return JSON.parse(fs.readFileSync(dataPath(guildId), 'utf8'));
  } catch {
    return { resetDate: null, leaderboardMessageId: null, clicksMessageId: null, roleCache: {}, top1VA: null };
  }
}

function saveData(guildId, data) {
  fs.writeFileSync(dataPath(guildId), JSON.stringify(data, null, 2));
}

function progressBar(current, max, length = 20) {
  const filled = Math.round((current / Math.max(max, 1)) * length);
  const empty = length - filled;
  return '▓'.repeat(Math.min(filled, length)) + '░'.repeat(Math.max(empty, 0));
}

function getRoleForClicks(clicks) {
  let role = null;
  for (const r of ROLES) { if (clicks >= r.clicks) role = r; }
  return role;
}

function getNextRole(clicks) {
  for (const r of ROLES) { if (clicks < r.clicks) return r; }
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
  if (!res.ok) throw new Error(`GMS API ${res.status}: ${await res.text()}`);
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

const VA_CLICK_OFFSET = {
  'mampionona1993': 1767,
};

function aggregateByVA(links, metrics) {
  const linkToVA = {};
  for (const link of links) linkToVA[link.id] = link.display_name;

  const vaClicks = {};
  for (const m of metrics) {
    const va = linkToVA[m.key];
    if (!va) continue;
    vaClicks[va] = (vaClicks[va] || 0) + (m.button_clicks || 0);
  }

  for (const [va, offset] of Object.entries(VA_CLICK_OFFSET)) {
    if (vaClicks[va] !== undefined) vaClicks[va] = Math.max(0, vaClicks[va] - offset);
  }

  return Object.entries(vaClicks)
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

// ─── Discord Bot ─────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]
});

function buildLeaderboardEmbeds(ranking, guildId) {
  const quote = randomQuote();
  const top10 = ranking.slice(0, 10);
  const topClicks = top10[0]?.clicks || 1;
  const medals = ['🥇', '🥈', '🥉'];
  const rankEmojis = ['🔥', '⚡', '💪', '✨', '💎', '🌟', '⭐'];

  let desc = '```\n╔══════════════════════════════════════╗\n║    💰 CLASSEMENT DE L\'EMPIRE 💰      ║\n╚══════════════════════════════════════╝\n```\n\n';

  if (top10.length === 0) {
    desc += '> Aucun clic enregistré pour cette période.\n> *Les rues sont vides... qui ose grind ?*\n';
  }

  for (let i = 0; i < top10.length; i++) {
    const va = top10[i];
    const medal = medals[i] || `**${i + 1}.**`;
    const emoji = rankEmojis[i] || '▸';
    const bar = progressBar(va.clicks, topClicks, 15);
    const role = getRoleForClicks(va.clicks);
    desc += `${medal} **${va.name}** — **${va.clicks}** clics ${emoji}\n┃ ${bar} ${role ? role.name : 'Pas encore de rang'}\n\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle('💰 L\'EMPIRE — TOP 10 CLICS')
    .setDescription(desc)
    .setColor(0xFFD700)
    .setFooter({ text: `💬 "${quote.text}" — ${quote.author}` })
    .setTimestamp();

  embed.addFields({ name: '📅 Période', value: '♾️ **Depuis le début**', inline: true });

  const motivEmbed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setDescription('> 💰 **Chaque clic, c\'est un billet de plus. Chaque effort te rapproche du trône.**\n> *Les vrais patrons n\'abandonnent jamais !*');

  return [embed, motivEmbed];
}

function buildStatsEmbed(username, ranking, guildId) {
  const quote = randomQuote();
  const data = loadData(guildId);
  const resetDate = data.resetDate ? new Date(data.resetDate) : null;
  const daysElapsed = resetDate ? Math.max(1, Math.ceil((Date.now() - resetDate.getTime()) / 86400000)) : 14;

  const userLower = username.toLowerCase();
  const idx = ranking.findIndex(r => r.name.toLowerCase() === userLower);

  if (idx === -1) {
    return new EmbedBuilder()
      .setTitle('❌ Aucun lien trouvé')
      .setDescription(`Je ne trouve pas de lien GetMySocial pour **${username}**.\n\nTon pseudo Discord doit être le même que ton nom sur GetMySocial.\nContacte un admin si c'est pas le cas.`)
      .setColor(0xFF0000);
  }

  const va = ranking[idx];
  const position = idx + 1;
  const avg = (va.clicks / daysElapsed).toFixed(1);
  const currentRole = getRoleForClicks(va.clicks);
  const nextRole = getNextRole(va.clicks);

  let desc = `## 📊 Tes stats, ${va.name} !\n\n`;
  desc += `🔢 **Clics total** : **${va.clicks}**\n📈 **Moyenne/jour** : **${avg}** clics\n🏅 **Rang** : ${currentRole ? currentRole.name : 'Pas encore de rang'}\n📍 **Position** : **#${position}** sur ${ranking.length}\n\n`;

  if (nextRole) {
    desc += `${progressBar(va.clicks, nextRole.clicks, 20)}\n➡️ Prochain rang : **${nextRole.name}** (${nextRole.clicks} clics) — encore **${nextRole.clicks - va.clicks}** clics !\n\n`;
  } else {
    desc += `♾️ **Tu as atteint le rang ultime ! L'Absolu !**\n\n`;
  }

  if (position <= 3) desc += `> 🔥 **Tu es dans le TOP 3 ! Tu domines l'empire !**`;
  else if (position <= 10) desc += `> ⚡ **Top 10 ! Tu es un vrai boss. Pousse encore pour le trône !**`;
  else desc += `> 💪 **Encore ${(ranking[9]?.clicks || 0) - va.clicks} clics pour entrer dans le Top 10 ! Grind plus fort !**`;

  return new EmbedBuilder()
    .setTitle(`💰 Statistiques de ${va.name}`)
    .setDescription(desc)
    .setColor(currentRole?.color || 0x5865F2)
    .setFooter({ text: `💬 "${quote.text}" — ${quote.author}` })
    .setTimestamp();
}

// ─── Role management ─────────────────────────────────────────
async function ensureRolesExist(guild) {
  const existingRoles = guild.roles.cache;
  for (const r of [...ROLES, ...TOP_ROLES.map(t => ({ name: t.name, color: t.color }))]) {
    const existing = existingRoles.find(er => er.name === r.name);
    if (!existing) {
      try {
        await guild.roles.create({ name: r.name, color: r.color, hoist: true, reason: 'Zoé Bot - Rôle Money auto' });
      } catch (e) { console.error(`❌ Impossible de créer le rôle ${r.name}:`, e.message); }
    } else if (!existing.hoist) {
      try { await existing.setHoist(true, 'Zoé Bot - Afficher séparément'); } catch {}
    }
  }

  try {
    await guild.roles.fetch();
    const botMember = await guild.members.fetchMe();
    const botHighestPos = botMember.roles.highest.position;
    const allBotRoles = [
      ...ROLES.map(r => ({ name: r.name, order: r.clicks })),
      ...TOP_ROLES.map(t => ({ name: t.name, order: 10000 + (4 - t.rank) })),
    ];
    allBotRoles.sort((a, b) => a.order - b.order);
    const positions = [];
    for (let i = 0; i < allBotRoles.length; i++) {
      const role = guild.roles.cache.find(r => r.name === allBotRoles[i].name);
      if (role && role.position < botHighestPos) positions.push({ role: role.id, position: i + 1 });
    }
    if (positions.length > 0) await guild.roles.setPositions(positions);
  } catch (e) { console.error('⚠️ Impossible de réordonner les rôles:', e.message); }
}

async function updateRoles(guild, ranking) {
  const data = loadData(guild.id);
  const announceChannelId = data.announceChannelId;
  const announceChannel = announceChannelId && guild.channels.cache.get(announceChannelId);
  const allRoleNames = ROLES.map(r => r.name);

  for (let i = 0; i < ranking.length; i++) {
    const va = ranking[i];
    const targetRole = getRoleForClicks(va.clicks);
    if (!targetRole) continue;

    let member;
    try {
      const members = await guild.members.fetch({ query: va.name, limit: 5 });
      member = members.find(m => m.user.username.toLowerCase() === va.name.toLowerCase() || m.displayName.toLowerCase() === va.name.toLowerCase());
    } catch { continue; }
    if (!member) continue;

    const previousRoleName = data.roleCache?.[va.name];
    const guildRoles = guild.roles.cache;
    const targetGuildRole = guildRoles.find(r => r.name === targetRole.name);
    if (!targetGuildRole) continue;

    const rolesToRemove = member.roles.cache.filter(r => allRoleNames.includes(r.name) && r.name !== targetRole.name);
    for (const [, role] of rolesToRemove) { try { await member.roles.remove(role); } catch {} }

    if (!member.roles.cache.has(targetGuildRole.id)) {
      try { await member.roles.add(targetGuildRole); } catch (e) { console.error(`Impossible d'ajouter le rôle ${targetRole.name} à ${va.name}:`, e.message); continue; }
    }

    if (previousRoleName !== targetRole.name) {
      console.log(`🎉 Promotion: ${va.name} → ${targetRole.name}`);
      const gifAttachment = loadGifAttachment(randomGif(va.clicks));

      if (announceChannel) {
        const quote = randomQuote();
        const promoEmbed = new EmbedBuilder()
          .setTitle('🔥🔥🔥  PROMOTION  🔥🔥🔥')
          .setDescription(
            `# 💰💰💰\n\n${member} EST MAINTENANT\n\n## ✨ ${targetRole.name.toUpperCase()} ✨\n\n**${va.clicks}+ CLICS** 🏆🏆🏆\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n> 💬 *"${quote.text}"*\n> — ${quote.author}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n🔥🔥 QUI SERA LE PROCHAIN À MONTER DANS L'EMPIRE ? 🔥🔥`
          )
          .setColor(targetRole.color).setTimestamp();
        if (gifAttachment) promoEmbed.setImage('attachment://promo.gif');
        try {
          const sendOpts = { embeds: [promoEmbed] };
          if (gifAttachment) sendOpts.files = [gifAttachment];
          await announceChannel.send(sendOpts);
        } catch (e) { console.error('❌ Erreur envoi annonce:', e.message); }
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!data.roleCache) data.roleCache = {};
    data.roleCache[va.name] = targetRole.name;

    const previousTop1 = data.top1VA;
    for (const top of TOP_ROLES) {
      const topGuildRole = guildRoles.find(r => r.name === top.name);
      if (!topGuildRole) continue;
      if (i + 1 === top.rank) {
        if (!member.roles.cache.has(topGuildRole.id)) { try { await member.roles.add(topGuildRole); } catch {} }
        if (top.rank === 1 && previousTop1 !== va.name && announceChannel) {
          const top1Embed = new EmbedBuilder()
            .setTitle('👑👑👑  NOUVEAU NUMÉRO 1  👑👑👑')
            .setDescription(`# 🏆🏆🏆\n\n🔥🔥 ${member} PREND LA\n\n## ✨ PREMIÈRE PLACE ✨\n\nAVEC **${va.clicks} CLICS** !!!\n\nC'EST LE NOUVEAU **${top.name.toUpperCase()}** DU SERVEUR !\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💪💪 QUI VA LE DÉTRÔNER ? LE GRIND CONTINUE... 💪💪`)
            .setColor(0xFFD700).setTimestamp();
          try {
            const top1Gif = loadGifAttachment(randomGifTop(), 'top1.gif');
            if (top1Gif) top1Embed.setImage('attachment://top1.gif');
            const top1Opts = { embeds: [top1Embed] };
            if (top1Gif) top1Opts.files = [top1Gif];
            await announceChannel.send(top1Opts);
          } catch {}
          data.top1VA = va.name;
        }
      } else {
        if (member.roles.cache.has(topGuildRole.id)) { try { await member.roles.remove(topGuildRole); } catch {} }
      }
    }
  }
  saveData(guild.id, data);
}

// ─── Update cycle ────────────────────────────────────────────
const rankings = {};

function buildRankings(links, metrics) {
  for (const guildId of Object.keys(SERVERS)) {
    rankings[guildId] = aggregateByVA(links.filter(SERVERS[guildId].keepLink), metrics);
  }
}

async function updateLeaderboard() {
  try {
    console.log('🔄 Mise à jour du leaderboard...');
    buildRankings(await fetchAllLinks(), await fetchMetrics());
    for (const guildId of Object.keys(SERVERS)) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) { console.error('❌ Serveur non trouvé:', guildId); continue; }
      try { await updateGuild(guild); } catch (e) { console.error(`❌ Erreur mise à jour ${guild.name}:`, e); }
    }
  } catch (e) { console.error('❌ Erreur mise à jour:', e); }
}

async function updateGuild(guild) {
  const conf = SERVERS[guild.id];
  const ranking = rankings[guild.id] || [];
  const data = loadData(guild.id);
  console.log(`📊 [${guild.name}] ${ranking.length} VAs, top: ${ranking[0]?.name} (${ranking[0]?.clicks} clics)`);

  const lbChannelId = data.leaderboardChannelId;
  let lbChannel = lbChannelId && (guild.channels.cache.get(lbChannelId) || await guild.channels.fetch(lbChannelId).catch(() => null));
  if (lbChannel) {
    const embeds = buildLeaderboardEmbeds(ranking, guild.id);
    let sent = false;
    if (data.leaderboardMessageId) {
      try { const msg = await lbChannel.messages.fetch(data.leaderboardMessageId); await msg.edit({ embeds }); sent = true; } catch { data.leaderboardMessageId = null; }
    }
    if (!sent) {
      try { const msg = await lbChannel.send({ embeds }); data.leaderboardMessageId = msg.id; saveData(guild.id, data); } catch (e) { console.error(`❌ Impossible d'envoyer le leaderboard:`, e.message); }
    }
  } else {
    console.log(`⏳ [${guild.name}] Leaderboard pas configuré — utilise /setupleaderboard`);
  }

  await ensureRolesExist(guild);
  await updateRoles(guild, ranking);

  const clicksChannelId = data.clicksChannelId;
  const clicksChannel = clicksChannelId && guild.channels.cache.get(clicksChannelId);
  if (clicksChannel) {
    const fresh = loadData(guild.id);
    const buttonEmbed = new EmbedBuilder()
      .setTitle('📊 Voir tes clics')
      .setDescription('> Clique sur le bouton ci-dessous pour voir tes stats personnelles !\n\n> 🔢 **Total de clics** · 📈 **Moyenne/jour** · 🏅 **Ton rang** · 📍 **Ta position**')
      .setColor(0x5865F2);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('view_clicks').setLabel('👀 Voir mes clics').setStyle(ButtonStyle.Primary));
    const msg = fresh.clicksMessageId && await clicksChannel.messages.fetch(fresh.clicksMessageId).catch(() => null);
    if (msg) { await msg.edit({ embeds: [buttonEmbed], components: [row] }); }
    else { const newMsg = await clicksChannel.send({ embeds: [buttonEmbed], components: [row] }); fresh.clicksMessageId = newMsg.id; saveData(guild.id, fresh); }
  }
  console.log(`✅ [${guild.name}] Leaderboard mis à jour`);
}

// ─── Register slash commands ─────────────────────────────────
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder().setName('reset').setDescription('Reset le leaderboard').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('forceleaderboard').setDescription('Forcer la mise à jour du leaderboard').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Afficher le classement des clics'),
    new SlashCommandBuilder().setName('stats').setDescription('Voir tes clics'),
    new SlashCommandBuilder().setName('forceannonces').setDescription('Renvoyer toutes les annonces de promotion').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('setupclicks').setDescription('Configurer le bouton "Voir mes clics" dans ce salon').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('setupannonces').setDescription('Les annonces de promotion seront envoyées dans ce salon').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('setupleaderboard').setDescription('Installer le panneau leaderboard dans ce salon').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ];

  const rest = new REST().setToken(DISCORD_TOKEN);
  for (const guildId of Object.keys(SERVERS)) {
    try {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands.map(c => c.toJSON()) });
      console.log(`✅ Commandes slash enregistrées sur ${guildId}`);
    } catch (e) { console.error(`❌ Erreur enregistrement commandes ${guildId}:`, e.message); }
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
  const guildId = interaction.guildId;
  if (!SERVERS[guildId]) return;
  const ranking = rankings[guildId] || [];

  if (interaction.isButton() && interaction.customId === 'view_clicks') {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ embeds: [buildStatsEmbed(interaction.user.username, ranking, guildId)] });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'stats') {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ embeds: [buildStatsEmbed(interaction.user.username, ranking, guildId)] });
    return;
  }

  if (interaction.commandName === 'reset') {
    const data = loadData(guildId);
    data.resetDate = new Date().toISOString();
    data.roleCache = {};
    saveData(guildId, data);
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle('🔄 Leaderboard Reset !').setDescription(`**Nouvelle période lancée !**\n\n> 💸 Les compteurs repartent à zéro.\n> 👑 Que le vrai patron se lève !\n\n📅 Début : <t:${Math.floor(Date.now() / 1000)}:F>`).setColor(0x2ECC71)] });
    setTimeout(updateLeaderboard, 2000);
    return;
  }

  if (interaction.commandName === 'leaderboard') {
    await interaction.deferReply({ ephemeral: true });
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Classement mis à jour !' });
    return;
  }

  if (interaction.commandName === 'forceleaderboard') {
    await interaction.deferReply({ ephemeral: true });
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Leaderboard mis à jour !' });
    return;
  }

  if (interaction.commandName === 'forceannonces') {
    await interaction.deferReply({ ephemeral: true });
    const data = loadData(guildId);
    data.roleCache = {};
    saveData(guildId, data);
    await updateLeaderboard();
    await interaction.editReply({ content: '✅ Toutes les annonces de promotion ont été renvoyées !' });
    return;
  }

  if (interaction.commandName === 'setupleaderboard') {
    await interaction.deferReply({ ephemeral: true });
    try {
      buildRankings(await fetchAllLinks(), await fetchMetrics());
      const embeds = buildLeaderboardEmbeds(rankings[guildId], guildId);
      const msg = await interaction.channel.send({ embeds });
      const data = loadData(guildId);
      data.leaderboardMessageId = msg.id;
      data.leaderboardChannelId = interaction.channel.id;
      saveData(guildId, data);
      await interaction.editReply({ content: '✅ Panneau leaderboard installé dans ce salon !' });
    } catch (err) { await interaction.editReply({ content: `❌ Erreur: ${err.message}` }); }
    return;
  }

  if (interaction.commandName === 'setupannonces') {
    const data = loadData(guildId);
    data.announceChannelId = interaction.channel.id;
    saveData(guildId, data);
    await interaction.reply({ content: '✅ Les annonces de promotion arriveront dans ce salon !', ephemeral: true });
    return;
  }

  if (interaction.commandName === 'setupclicks') {
    const data = loadData(guildId);
    const buttonEmbed = new EmbedBuilder()
      .setTitle('📊 Voir tes clics')
      .setDescription('> Clique sur le bouton ci-dessous pour voir tes stats personnelles !\n\n> 🔢 **Total de clics** · 📈 **Moyenne/jour** · 🏅 **Ton rang** · 📍 **Ta position**\n\n> 💰 *Chaque clic te rapproche du trône !*')
      .setColor(0x5865F2);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('view_clicks').setLabel('👀 Voir mes clics').setStyle(ButtonStyle.Primary));
    const msg = await interaction.channel.send({ embeds: [buttonEmbed], components: [row] });
    data.clicksMessageId = msg.id;
    saveData(guildId, data);
    await interaction.reply({ content: '✅ Bouton configuré !', ephemeral: true });
    return;
  }
});

if (!DISCORD_TOKEN) { console.error('❌ DISCORD_TOKEN manquant !'); process.exit(1); }
if (!GMS_API_KEY) { console.error('❌ GMS_API_KEY manquant !'); process.exit(1); }
client.login(DISCORD_TOKEN);
