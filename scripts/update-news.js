import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rss from 'rss-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new rss();

// Fuentes de noticias RSS por equipo/continente
const NEWS_SOURCES = [
  { url: 'https://www.espn.com/espn/rss/soccer', name: 'ESPN' },
  { url: 'https://www.marca.com/rss/futbol.html', name: 'Marca' },
  { url: 'https://www.as.com/rss/futbol.xml', name: 'AS' },
  { url: 'https://www.goal.com/feeds/en/news', name: 'Goal' },
  { url: 'https://www.skysports.com/rss/11076', name: 'Sky Sports' },
  { url: 'https://www.bbc.com/sport/football/rss.xml', name: 'BBC Sport' },
];

// Mapeo de nombres de equipos a keywords para búsqueda
const TEAM_KEYWORDS: Record<string, string[]> = {
  mexico: ['méxico', 'mexico', 'seleccion mexicana', 'miseleccion', 'tri'],
  canada: ['canadá', 'canada', 'seleccion canadiense', 'canadasoccer'],
  'estados-unidos': ['estados unidos', 'usa', 'eeuu', 'usmnt', 'seleccion estadounidense'],
  argentina: ['argentina', 'seleccion argentina', 'scaloni', 'messi'],
  brasil: ['brasil', 'brazil', 'seleccion brasileña', 'canarinha'],
  uruguay: ['uruguay', 'seleccion uruguaya', 'celeste'],
  colombia: ['colombia', 'seleccion colombiana'],
  ecuador: ['ecuador', 'seleccion ecuatoriana', 'tricolor'],
  chile: ['chile', 'seleccion chilena', 'la roja'],
  peru: ['perú', 'peru', 'seleccion peruana', 'bicolor'],
  paraguay: ['paraguay', 'seleccion paraguaya', 'albirroja'],
  bolivia: ['bolivia', 'seleccion boliviana'],
  venezuela: ['venezuela', 'seleccion venezolana', 'vinotinto'],
  inglaterra: ['inglaterra', 'england', 'seleccion inglesa', 'three lions'],
  francia: ['francia', 'france', 'seleccion francesa', 'les bleus'],
  alemania: ['alemania', 'germany', 'seleccion alemana', 'die mannschaft'],
  espana: ['españa', 'spain', 'seleccion española', 'la roja'],
  portugal: ['portugal', 'seleccion portuguesa', 'selecao'],
  italia: ['italia', 'italy', 'seleccion italiana', 'azzurri'],
  'paises-bajos': ['países bajos', 'holanda', 'netherlands', 'oranje'],
  belgica: ['bélgica', 'belgium', 'seleccion belga', 'red devils'],
  croacia: ['croacia', 'croatia', 'seleccion croata'],
  dinamarca: ['dinamarca', 'denmark', 'seleccion danesa'],
  polonia: ['polonia', 'poland', 'seleccion polaca'],
  suiza: ['suiza', 'switzerland', 'seleccion suiza', 'nati'],
  austria: ['austria', 'seleccion austriaca'],
  serbia: ['serbia', 'seleccion serbia'],
  escocia: ['escocia', 'scotland', 'seleccion escocesa'],
  'republica-checa': ['república checa', 'czech republic', 'seleccion checa'],
  turquia: ['turquía', 'turkey', 'seleccion turca'],
  rusia: ['rusia', 'russia', 'seleccion rusa'],
  ucrania: ['ucrania', 'ukraine', 'seleccion ucraniana'],
  suecia: ['suecia', 'sweden', 'seleccion sueca'],
  grecia: ['grecia', 'greece', 'seleccion griega'],
  hungria: ['hungría', 'hungary', 'seleccion húngara'],
  rumania: ['rumanía', 'romania', 'seleccion rumana'],
  bulgaria: ['bulgaria', 'seleccion búlgara'],
  islandia: ['islandia', 'iceland', 'seleccion islandesa'],
  finlandia: ['finlandia', 'finland', 'seleccion finlandesa'],
  irlanda: ['irlanda', 'ireland', 'seleccion irlandesa'],
  'irlanda-del-norte': ['irlanda del norte', 'northern ireland'],
  gales: ['gales', 'wales', 'seleccion galesa'],
  marruecos: ['marruecos', 'morocco', 'seleccion marroquí', 'leones del atlas'],
  senegal: ['senegal', 'seleccion senegalesa', 'leones de la teranga'],
  argelia: ['argelia', 'algeria', 'seleccion argelina', 'zorros del desierto'],
  tunez: ['túnez', 'tunisia', 'seleccion tunecina', 'aguilas de cartago'],
  nigeria: ['nigeria', 'seleccion nigeriana', 'super eagles'],
  camerun: ['camerún', 'cameroon', 'seleccion camerunesa', 'leones indomables'],
  ghana: ['ghana', 'seleccion ghanesa', 'black stars'],
  'costas-de-marfil': ['costa de marfil', 'ivory coast', 'seleccion marfileña', 'elefantes'],
  mali: ['mali', 'malí', 'seleccion maliense'],
  'republica-democratica-del-congo': ['republica democratica del congo', 'dr congo', 'rdc'],
  guinea: ['guinea', 'seleccion guineana'],
  egipto: ['egipto', 'egypt', 'seleccion egipcia', 'faraones'],
  'sudafrica': ['sudáfrica', 'south africa', 'seleccion sudafricana', 'bafana bafana'],
  australia: ['australia', 'socceroos', 'seleccion australiana'],
  iran: ['irán', 'iran', 'seleccion iraní', 'team melli'],
  japon: ['japón', 'japan', 'seleccion japonesa', 'samurai blue'],
  'corea-del-sur': ['corea del sur', 'south korea', 'seleccion surcoreana', 'taeguk warriors'],
  'arabia-saudita': ['arabia saudita', 'saudi arabia', 'seleccion saudí', 'halcones verdes'],
  china: ['china', 'seleccion china'],
  irak: ['irak', 'iraq', 'seleccion iraquí'],
  'emiratos-arabes-unidos': ['emiratos árabes unidos', 'uae', 'seleccion emiratí'],
  qatar: ['qatar', 'seleccion catarí'],
  oman: ['omán', 'oman', 'seleccion omaní'],
  uzbekistan: ['uzbekistán', 'uzbekistan', 'seleccion uzbeka'],
  jordania: ['jordania', 'jordan', 'seleccion jordana'],
  kuwait: ['kuwait', 'seleccion kuwaití'],
  tailandia: ['tailandia', 'thailand', 'seleccion tailandesa'],
  vietnam: ['vietnam', 'seleccion vietnamita'],
  filipinas: ['filipinas', 'philippines', 'seleccion filipina'],
  indonesia: ['indonesia', 'seleccion indonesia'],
  malasia: ['malasia', 'malaysia', 'seleccion malaya'],
  singapur: ['singapur', 'singapore', 'seleccion singapurense'],
  'nueva-zelanda': ['nueva zelanda', 'new zealand', 'socceroos'],
  tahiti: ['tahití', 'tahiti', 'seleccion tahitiana'],
  'nueva-caledonia': ['nueva caledonia', 'new caledonia', 'seleccion caledonia'],
  'islas-salomon': ['islas salomón', 'solomon islands', 'seleccion salomonense'],
  'papua-nueva-guinea': ['papúa nueva guinea', 'papua new guinea'],
  fiji: ['fiyi', 'fiji', 'seleccion fiyiana'],
  vanuatu: ['vanuatu', 'seleccion vanuatuense'],
  tonga: ['tonga', 'seleccion tongana'],
  'samoa-americana': ['samoa americana', 'american samoa'],
  guam: ['guam', 'seleccion de guam'],
};

// Función para normalizar texto
function normalizeText(text: string) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Función para encontrar noticias relevantes a un equipo
function findRelevantNews(teamId: string, articles: Array<{ title: string; content: string; pubDate: string; link: string; source: string }>) {
  const keywords = TEAM_KEYWORDS[teamId] || [];
  const normalizedTeamName = normalizeText(teamId.replace(/-/g, ' '));
  
  return articles.filter(article => {
    const normalizedTitle = normalizeText(article.title);
    const normalizedContent = normalizeText(article.content || '');
    
    // Verificar si alguna keyword coincide en título o contenido
    const matchesKeyword = keywords.some(keyword => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedTitle.includes(normalizedKeyword) || normalizedContent.includes(normalizedKeyword);
    });
    
    // También verificar si el nombre del equipo aparece directamente
    const matchesTeamName = normalizedTitle.includes(normalizedTeamName) || normalizedContent.includes(normalizedTeamName);
    
    return matchesKeyword || matchesTeamName;
  }).map(article => ({
    title: article.title,
    url: article.link,
    source: article.source,
    published: article.pubDate,
  }));
}

// Función principal de actualización
async function updateNews() {
  console.log('🔄 Iniciando actualización de noticias...');
  
  // Cargar datos actuales de equipos
  const teamsPath = path.join(__dirname, 'src/content/teams/data.js');
  const teamsContent = fs.readFileSync(teamsPath, 'utf-8');
  
  // Parsear el archivo JS para extraer los objetos de equipo
  const teamMatches = teamsContent.matchAll(/---\nid: "([^"]+)"[\s\S]*?(?=---|$)/g);
  const teams: any[] = [];
  
  for (const match of teamMatches) {
    const idMatch = match[0].match(/id: "([^"]+)"/);
    const nameMatch = match[0].match(/name: "([^"]+)"/);
    const codeMatch = match[0].match(/code: "([^"]+)"/);
    const continentMatch = match[0].match(/continent: "([^"]+)"/);
    const groupMatch = match[0].match(/group: "([^"]+)"?/);
    const flagMatch = match[0].match(/flag: "([^"]+)"/);
    const qualifiedMatch = match[0].match(/qualified: (true|false)/);
    const playersMatch = match[0].match(/players: \[([\s\S]*?)\]/);
    const socialMatch = match[0].match(/social:\s*\{[\s\S]*?\}/);
    const newsMatch = match[0].match(/news:\s*\[([\s\S]*?)\]/);
    
    const players = playersMatch ? playersMatch[1].split(',').map(p => p.trim().replace(/^"|"$/g, '')).filter(Boolean) : [];
    
    // Parsear noticias existentes
    let existingNews: any[] = [];
    if (newsMatch && newsMatch[1].trim()) {
      try {
        // Convertir formato YAML a JSON
        const newsItems = newsMatch[1].split(/\n\s*-/).filter(Boolean);
        for (const item of newsItems) {
          const titleMatch = item.match(/title: "([^"]+)"/);
          const urlMatch = item.match(/url: "([^"]+)"/);
          const sourceMatch = item.match(/source: "([^"]+)"/);
          const publishedMatch = item.match(/published: "([^"]+)"/);
          if (titleMatch && urlMatch && sourceMatch && publishedMatch) {
            existingNews.push({
              title: titleMatch[1],
              url: urlMatch[1],
              source: sourceMatch[1],
              published: publishedMatch[1],
            });
          }
        }
      } catch (e) {
        console.warn(`Error parsing news for ${idMatch?.[1]}:`, e);
      }
    }
    
    teams.push({
      id: idMatch?.[1] || '',
      name: nameMatch?.[1] || '',
      code: codeMatch?.[1] || '',
      continent: continentMatch?.[1] || '',
      group: groupMatch?.[1] || undefined,
      flag: flagMatch?.[1] || '',
      qualified: qualifiedMatch?.[1] === 'true',
      players,
      social: socialMatch ? eval(`({${socialMatch[0].split('social:')[1].trim()}})`)[0] : {},
      news: existingNews,
    });
  }
  
  // Recopilar artículos de todas las fuentes RSS
  console.log('📡 Obteniendo artículos de fuentes RSS...');
  const allArticles: Array<{ title: string; content: string; pubDate: string; link: string; source: string }> = [];
  
  for (const source of NEWS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      feed.items.forEach(item => {
        allArticles.push({
          title: item.title || '',
          content: item.contentSnippet || item.content || '',
          pubDate: item.pubDate || new Date().toISOString(),
          link: item.link || '',
          source: source.name,
        });
      });
      console.log(`  ✓ ${source.name}: ${feed.items.length} artículos`);
    } catch (error) {
      console.error(`  ✗ Error en ${source.name}:`, error);
    }
  }
  
  // Actualizar noticias para cada equipo
  console.log('🔍 Buscando noticias relevantes para cada equipo...');
  const updatedTeams = teams.map(team => {
    const relevantNews = findRelevantNews(team.id, allArticles);
    
    // Combinar noticias existentes con nuevas (evitando duplicados por URL)
    const combinedNews = [...team.news];
    for (const newItem of relevantNews) {
      const exists = combinedNews.some(item => item.url === newItem.url);
      if (!exists) {
        combinedNews.push(newItem);
      }
    }
    
    // Ordenar por fecha (más recientes primero) y limitar a 10 noticias
    combinedNews.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    team.news = combinedNews.slice(0, 10);
    
    return team;
  });
  
  // Escribir archivo actualizado
  let output = '';
  for (const team of updatedTeams) {
    output += `---\n`;
    output += `id: "${team.id}"\n`;
    output += `name: "${team.name}"\n`;
    output += `code: "${team.code}"\n`;
    output += `group: "${team.group || ''}"\n`;
    output += `continent: "${team.continent}"\n`;
    output += `flag: "${team.flag}"\n`;
    output += `qualified: ${team.qualified}\n`;
    output += `players: [${team.players.map(p => `"${p}"`).join(', ')}]\n`;
    output += `social: ${JSON.stringify(team.social)}\n`;
    output += `news: [\n`;
    for (const news of team.news) {
      output += `  {\n`;
      output += `    title: "${news.title.replace(/"/g, '\\"')}",\n`;
      output += `    url: "${news.url}",\n`;
      output += `    source: "${news.source}",\n`;
      output += `    published: "${news.published}"\n`;
      output += `  },\n`;
    }
    output += `]\n`;
    output += `---\n\n`;
  }
  
  fs.writeFileSync(teamsPath, output);
  console.log('✅ Actualización completada. Archivo de equipos actualizado.');
}

// Ejecutar
updateNews().catch(console.error);