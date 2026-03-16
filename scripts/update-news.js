import PocketBase from 'pocketbase';
import RssParser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { translate } from '@vitalets/google-translate-api';
import { convert } from 'html-to-text';

const PB_URL = process.env.POCKETBASE_URL || 'https://futbolxp.pockethost.io';
const PB_EMAIL = process.env.POCKETBASE_EMAIL || 'pegaso@agentmail.to';
const PB_PASSWORD = process.env.POCKETBASE_PASSWORD || 'WiKCaJLJqdtXD65';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const parser = new RssParser();

// Load players for matching
const playersData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/players/data.json'), 'utf-8'));

// RSS news sources
const NEWS_SOURCES = [
  { url: 'https://www.espn.com/espn/rss/soccer/news', name: 'ESPN' },
  { url: 'https://e00-marca.uecdn.es/rss/futbol/futbol-internacional.xml', name: 'Marca' },
  { url: 'https://feeds.as.com/mrss-s/pages/as/site/as.com/portada/videos/sport/futbol/', name: 'AS' },
  { url: 'https://www.goal.com/feeds/en/news', name: 'Goal' },
  { url: 'https://www.skysports.com/rss/11095', name: 'Sky Sports' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', name: 'BBC Sport' },
  { url: 'https://www.espn.com.mx/espn/rss/futbol/news', name: 'ESPN MX' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Soccer.xml', name: 'NY Times' },
];

const CRAWL_SOURCES = [
  { 
    url: 'https://www.elfutbolero.com.mx/mundial-2026', 
    name: 'El Futbolero',
    includePatterns: ['**/mundial-2026/**']
  }
];

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

async function fetchCrawlArticles() {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.log('Skipping crawl sources: Cloudflare credentials not set.');
    return [];
  }

  console.log('Starting Cloudflare crawl jobs...');
  const allArticles = [];

  for (const source of CRAWL_SOURCES) {
    try {
      console.log(`  [CRAWL] Starting job for ${source.name}...`);
      const initRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering/crawl`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            limit: 40,
            depth: 2,
            formats: ['markdown'],
            options: {
              includePatterns: source.includePatterns,
              waitForSelector: 'main a[href*="mundial-2026"]',
            }
          }),
        }
      );

      const initData = await initRes.json();
      if (!initData.success) {
        console.error(`  [FAIL] ${source.name} init: ${JSON.stringify(initData.errors)}`);
        continue;
      }

      const jobId = initData.result;
      console.log(`  [OK] Job ID: ${jobId}. Polling...`);

      // Polling
      let records = [];
      const maxAttempts = 30; 
      for (let i = 0; i < maxAttempts; i++) {
        await sleep(10000); 
        const pollRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering/crawl/${jobId}?limit=20`,
          { headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` } }
        );
        const pollData = await pollRes.json();
        const status = pollData.result?.status;

        // Log status even if not completed
        if (i % 5 === 0) console.log(`    ... Status: ${status} (${pollData.result?.records?.length || 0} records so far)`);

        if (status === 'completed' || (status === 'running' && pollData.result?.records?.length > 1)) {
          console.log(`  [INFO] Crawl status: ${status}. Found ${pollData.result?.records?.length} records.`);
          records = pollData.result?.records || [];
          if (status === 'completed') break;
          if (records.length > 5) break; // If we have enough, we can stop early or continue
        } else if (status !== 'running' && status !== 'completed') {
          console.error(`  [FAIL] ${source.name} terminal status: ${status}`);
          break;
        }
        console.log(`  ... poll ${i+1}/${maxAttempts} (status: ${status})`);
      }

      console.log(`    [DEBUG] Processing ${records.length} records...`);
      for (const record of records) {
        console.log(`    - Discovered: ${record.url} (Type: ${record.metadata?.contentType || 'unknown'})`);
        
        // Skip the index page itself
        if (record.url === source.url || record.url.endsWith('/mundial-2026') || record.url.endsWith('/mundial-2026/')) {
          console.log(`      (Skipping index page)`);
          continue;
        }
        
        allArticles.push({
          title: record.metadata?.title || 'Noticia de Mundial 2026',
          content: record.markdown || '',
          pubDate: new Date().toISOString(),
          link: record.url,
          source: source.name,
          imageUrl: '',
        });
      }
    } catch (error) {
      console.error(`  [ERROR] ${source.name}: ${error.message}`);
    }
  }

  console.log(`Total articles fetched from crawl: ${allArticles.length}`);
  return allArticles;
}

// Team keywords for matching
const TEAM_KEYWORDS = {
  mexico: { name: 'Mexico', keywords: ['mexico', 'seleccion mexicana', 'miseleccion', 'tri', 'el tri', 'jimmy lozano', 'javier aguirre', 'ochoa', 'guillermo ochoa', 'malagon', 'raúl jiménez', 'santi giménez', 'chucky lozano', 'edson álvarez'] },
  canada: { name: 'Canada', keywords: ['canada', 'canadasoccer', 'jesse marsch'] },
  'estados-unidos': { name: 'Estados Unidos', keywords: ['estados unidos', 'usa', 'eeuu', 'usmnt', 'gregg berhalter', 'us soccer'] },
  argentina: { name: 'Argentina', keywords: ['argentina', 'seleccion argentina', 'scaloni', 'albiceleste'] },
  brasil: { name: 'Brasil', keywords: ['brasil', 'brazil', 'selecao', 'canarinha', 'dorival junior'] },
  uruguay: { name: 'Uruguay', keywords: ['uruguay', 'celeste', 'bielsa'] },
  colombia: { name: 'Colombia', keywords: ['colombia', 'seleccion colombiana', 'nestor lorenzo'] },
  ecuador: { name: 'Ecuador', keywords: ['ecuador', 'seleccion ecuatoriana', 'felix sanchez'] },
  chile: { name: 'Chile', keywords: ['chile', 'seleccion chilena', 'la roja chile'] },
  peru: { name: 'Peru', keywords: ['peru', 'seleccion peruana', 'bicolor'] },
  paraguay: { name: 'Paraguay', keywords: ['paraguay', 'albirroja'] },
  bolivia: { name: 'Bolivia', keywords: ['bolivia', 'seleccion boliviana'] },
  venezuela: { name: 'Venezuela', keywords: ['venezuela', 'vinotinto'] },
  inglaterra: { name: 'Inglaterra', keywords: ['england', 'three lions', 'gareth southgate', 'english football'] },
  francia: { name: 'Francia', keywords: ['france', 'les bleus', 'didier deschamps', 'equipe de france'] },
  alemania: { name: 'Alemania', keywords: ['germany', 'die mannschaft', 'julian nagelsmann', 'dfb'] },
  espana: { name: 'Espana', keywords: ['spain', 'la roja spain', 'luis de la fuente', 'seleccion espanola'] },
  portugal: { name: 'Portugal', keywords: ['portugal', 'selecao portuguesa', 'roberto martinez portugal'] },
  italia: { name: 'Italia', keywords: ['italy', 'azzurri', 'luciano spalletti'] },
  'paises-bajos': { name: 'Paises Bajos', keywords: ['netherlands', 'oranje', 'ronald koeman'] },
  belgica: { name: 'Belgica', keywords: ['belgium', 'red devils', 'domenico tedesco'] },
  croacia: { name: 'Croacia', keywords: ['croatia', 'seleccion croata', 'zlatko dalic'] },
  dinamarca: { name: 'Dinamarca', keywords: ['denmark', 'danish football'] },
  polonia: { name: 'Polonia', keywords: ['poland', 'polish football'] },
  suiza: { name: 'Suiza', keywords: ['switzerland', 'nati', 'swiss football'] },
  austria: { name: 'Austria', keywords: ['austria', 'austrian football'] },
  serbia: { name: 'Serbia', keywords: ['serbia', 'serbian football'] },
  turquia: { name: 'Turquia', keywords: ['turkey', 'turkish football'] },
  ucrania: { name: 'Ucrania', keywords: ['ukraine', 'ukrainian football'] },
  suecia: { name: 'Suecia', keywords: ['sweden', 'swedish football'] },
  marruecos: { name: 'Marruecos', keywords: ['morocco', 'leones del atlas', 'atlas lions', 'walid regragui'] },
  senegal: { name: 'Senegal', keywords: ['senegal', 'teranga lions'] },
  nigeria: { name: 'Nigeria', keywords: ['nigeria', 'super eagles'] },
  camerun: { name: 'Camerun', keywords: ['cameroon', 'indomitable lions'] },
  ghana: { name: 'Ghana', keywords: ['ghana', 'black stars'] },
  egipto: { name: 'Egipto', keywords: ['egypt', 'pharaohs'] },
  'sudafrica': { name: 'Sudafrica', keywords: ['south africa', 'bafana bafana'] },
  australia: { name: 'Australia', keywords: ['australia', 'socceroos'] },
  iran: { name: 'Iran', keywords: ['iran', 'team melli'] },
  japon: { name: 'Japon', keywords: ['japan', 'samurai blue', 'japanese football'] },
  'corea-del-sur': { name: 'Corea del Sur', keywords: ['south korea', 'taeguk warriors', 'korean football'] },
  'arabia-saudita': { name: 'Arabia Saudita', keywords: ['saudi arabia', 'green falcons'] },
  qatar: { name: 'Qatar', keywords: ['qatar', 'qatari football'] },
};

function normalizeText(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findRelevantPlayers(article) {
  const normalizedTitle = normalizeText(article.title || '');
  const normalizedContent = normalizeText(article.content || '');
  const text = `${normalizedTitle} ${normalizedContent}`;

  const matchedPlayers = [];
  for (const player of playersData) {
    const normalizedPlayerName = normalizeText(player.name);
    const nameParts = normalizedPlayerName.split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // Match full name
    const matchesFullName = normalizedPlayerName.length > 5 && text.includes(normalizedPlayerName);
    // Match last name (only if it matches as a whole word and is specific enough)
    const matchesLastName = lastName.length >= 5 && new RegExp(`\\b${lastName}\\b`, 'i').test(text);

    if (matchesFullName || matchesLastName) {
      console.log(`  [MATCH] Player: ${player.name} (${player.id})`);
      matchedPlayers.push({ playerId: player.id, playerName: player.name });
    }
  }
  return matchedPlayers;
}

function findRelevantTeams(article) {
  const normalizedTitle = normalizeText(article.title || '');
  const normalizedContent = normalizeText(article.content || '');
  const text = `${normalizedTitle} ${normalizedContent}`;

  const matchedTeams = [];

  for (const [teamId, teamData] of Object.entries(TEAM_KEYWORDS)) {
    const normalizedTeamName = normalizeText(teamId.replace(/-/g, ' '));
    const matchesTeamName = text.includes(normalizedTeamName);
    const matchesKeyword = teamData.keywords.some(kw => text.includes(normalizeText(kw)));

    if (matchesTeamName || matchesKeyword) {
      matchedTeams.push({ teamId, teamName: teamData.name });
    }
  }

  return matchedTeams;
}

async function authenticate() {
  try {
    await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);
    console.log('Authenticated with PocketBase');
  } catch (e) {
    console.error('Auth failed:', e.message);
    throw e;
  }
}

async function fetchArticles() {
  console.log('Fetching RSS feeds...');
  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items) {
        const content = item['content:encoded'] || item.content || item.contentSnippet || '';
        allArticles.push({
          title: item.title || '',
          content: content,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          link: item.link || '',
          source: source.name,
          imageUrl: item.enclosure?.url || item['media:content']?.['$']?.url || '',
        });
      }
      console.log(`  [OK] ${source.name}: ${feed.items.length} articles`);
    } catch (error) {
      console.error(`  [FAIL] ${source.name}: ${error.message}`);
    }
  }

  return allArticles;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processSourceItem(text, isEnglishSource, retries = 2) {
  let cleanText = convert(text || '', { wordwrap: false });
  if (isEnglishSource && cleanText.trim() !== '') {
    for (let i = 0; i <= retries; i++) {
        try {
          const { text: translatedText } = await translate(cleanText, { to: 'es' });
          return translatedText;
        } catch (e) {
          if (i === retries) {
            console.error('Final translation error:', e.message);
            return cleanText;
          }
          console.log(`Retrying translation (${i+1}/${retries})...`);
          await sleep(10000 * (i + 1));
        }
    }
  }
  return cleanText;
}

async function saveNews(articles) {
  console.log('Processing and saving news to PocketBase...');
  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    if (!article.link || !article.title) continue;
    
    const matchedTeams = findRelevantTeams(article);
    const matchedPlayers = findRelevantPlayers(article);
    
    if (matchedTeams.length === 0 && matchedPlayers.length === 0) {
      if (article.source === 'El Futbolero') {
        console.log(`    [SKIP] El Futbolero article "${article.title}" matched no teams or players.`);
      }
      continue;
    }

    if (article.source === 'El Futbolero') {
      console.log(`    [MATCH] El Futbolero article "${article.title}" matched ${matchedTeams.length} teams and ${matchedPlayers.length} players.`);
    }

    const isEnglishSource = ['ESPN', 'Goal', 'Sky Sports', 'BBC Sport', 'NY Times'].includes(article.source);

    let processedTitle = article.title;
    let processedSnippet = article.content;

    try {
      if (isEnglishSource) {
         processedTitle = await processSourceItem(article.title, true);
         await sleep(2000);
         let cleanContent = convert(article.content || '', { wordwrap: false });
         if (cleanContent.length > 2500) cleanContent = cleanContent.substring(0, 2500) + '...';
         processedSnippet = await processSourceItem(cleanContent, true);
      } else {
         processedSnippet = convert(article.content || '', { wordwrap: false }).substring(0, 2500);
         if (article.content && article.content.length > 2500) processedSnippet += '...';
      }
      
      if (processedSnippet && !processedSnippet.includes('\n\n') && processedSnippet.length > 300) {
          const midpoint = Math.floor(processedSnippet.length / 2);
          const splitPoint = processedSnippet.indexOf('. ', midpoint);
          if (splitPoint !== -1) {
              processedSnippet = processedSnippet.substring(0, splitPoint + 1) + '\n\n' + processedSnippet.substring(splitPoint + 2);
          }
      }
    } catch (e) {
       console.log('Error processing text:', e.message);
    }

    await sleep(2000);

    const processedUrls = new Set();

    // Save for teams
    for (const { teamId, teamName } of matchedTeams) {
      const key = `${article.link}-${teamId}`;
      if (processedUrls.has(key)) continue;
      await saveToPocketBase(article, processedTitle, processedSnippet, teamId, teamName, null);
      processedUrls.add(key);
      saved++;
    }

    // Save for players
    for (const { playerId } of matchedPlayers) {
      const key = `${article.link}-${playerId}`;
      if (processedUrls.has(key)) continue;
      
      const player = playersData.find(p => p.id === playerId);
      const teamId = player ? player.team : '';
      const teamData = TEAM_KEYWORDS[teamId];
      const teamName = teamData ? teamData.name : '';
      
      await saveToPocketBase(article, processedTitle, processedSnippet, teamId, teamName, playerId);
      processedUrls.add(key);
      saved++;
    }
  }

  console.log(`Results: ${saved} saved, ${skipped} duplicates skipped, ${errors} errors`);
}

async function saveToPocketBase(article, processedTitle, processedSnippet, teamId, teamName, playerId) {
    try {
        let publishedDate;
        try {
          publishedDate = new Date(article.pubDate).toISOString().replace('T', ' ').replace('Z', '');
        } catch {
          publishedDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
        }

        await pb.collection('news').create({
          title: processedTitle.slice(0, 500),
          url: article.link,
          source: article.source,
          published: publishedDate,
          teamId,
          teamName,
          playerId: playerId || '',
          contentSnippet: (processedSnippet || '').slice(0, 2500),
          imageUrl: article.imageUrl || '',
        });
    } catch (e) {
        if (!(e.status === 400 && e.data?.data?.url?.code === 'validation_not_unique')) {
            console.error(`Error saving article: ${e.message}`);
        }
    }
}

async function cleanOldNews() {
  console.log('Cleaning old news (>30 days)...');
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().replace('T', ' ').replace('Z', '');

    const oldRecords = await pb.collection('news').getList(1, 200, {
      filter: `published < "${cutoffStr}"`,
    });

    for (const record of oldRecords.items) {
      await pb.collection('news').delete(record.id);
    }

    console.log(`Cleaned ${oldRecords.items.length} old records`);
  } catch (e) {
    console.error('Error cleaning old news:', e.message);
  }
}

async function main() {
  console.log('=== FutbolExperto News Update ===');
  await authenticate();
  
  const rssArticles = await fetchArticles();
  const crawlArticles = await fetchCrawlArticles();
  
  const allArticles = [...rssArticles, ...crawlArticles];
  
  // Sort or prioritize if needed, here we just take the first 40 to avoid over-processing
  const articles = allArticles.slice(0, 40);
  console.log(`Processing total of ${articles.length} articles...`);
  await saveNews(articles);
  await cleanOldNews();
  console.log('=== Update complete ===');
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
