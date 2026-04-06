import type { CollectionEntry } from 'astro:content';
import type { NewsItem } from './pocketbase';

export interface AnalystHeadline {
  title: string;
  url: string;
  source: string;
  published: string;
  id?: string;
}

export interface AnalystSignal {
  label: string;
  value: string;
}

export interface AnalystCard {
  teamId: string;
  teamName: string;
  code: string;
  flag?: string;
  group?: string;
  continent: string;
  qualified: boolean;
  latestHeadline: string;
  latestPublished: string;
  newsCount: number;
  recentNewsCount: number;
  trendScore: number;
  momentum: 'Alta' | 'Media' | 'Baja';
  tone: 'Positivo' | 'Mixto' | 'Atento';
  editorialBadge: 'En ascenso' | 'En alerta' | 'Ruido alto' | 'Plantel estable';
  trendDirection: '↗' | '↘' | '→';
  trendLine: Array<{ label: string; value: number }>;
  themes: string[];
  signals: AnalystSignal[];
  strengths: string[];
  risks: string[];
  analysis: string;
  headlines: AnalystHeadline[];
}

export interface AnalystComparison {
  left: AnalystCard;
  right: AnalystCard;
  summary: string;
  advantages: string[];
}

export interface AnalystTier {
  title: string;
  description: string;
  teams: AnalystCard[];
}

export interface AnalystForecastBoard {
  title: string;
  description: string;
  teams: AnalystCard[];
}

export interface AnalystEditorialSummary {
  headline: string;
  summary: string;
  highlights: string[];
}

const THEME_MAP = [
  { label: 'Ataque', keywords: ['gol', 'goles', 'delantero', 'delantera', 'ataque', 'ofensiva', 'ofensivo', 'anoto', 'anotó', 'marco', 'marcó'] },
  { label: 'Defensa', keywords: ['defensa', 'defensiva', 'zaga', 'porter', 'portero', 'arco', 'valla', 'encajo', 'encajó'] },
  { label: 'Entrenador', keywords: ['dt', 'tecnico', 'técnico', 'entrenador', 'seleccionador', 'banquillo'] },
  { label: 'Convocatoria', keywords: ['convocatoria', 'lista', 'prelista', 'nomina', 'nómina', 'citado', 'convocados'] },
  { label: 'Lesiones', keywords: ['lesion', 'lesión', 'baja', 'duda', 'recuperacion', 'recuperación', 'molestia', 'parte medico'] },
  { label: 'Clasificación', keywords: ['clasifico', 'clasificó', 'clasifica', 'clasificacion', 'clasificación', 'eliminatoria', 'playoff', 'repechaje', 'grupo'] },
  { label: 'Figura', keywords: ['estrella', 'figura', 'capitan', 'capitán', 'referente', 'lider', 'líder'] },
  { label: 'Preparación', keywords: ['amistoso', 'preparacion', 'preparación', 'campamento', 'concentracion', 'concentración', 'microciclo'] },
];

const POSITIVE_WORDS = ['gana', 'ganó', 'golea', 'goleó', 'remonta', 'clasifica', 'clasificó', 'ilusiona', 'ilusionó', 'destaca', 'confirma', 'vuelve', 'recupera', 'triunfo', 'triunfó'];
const NEGATIVE_WORDS = ['pierde', 'perdió', 'crisis', 'lesion', 'lesión', 'baja', 'duda', 'problema', 'alerta', 'presion', 'presión', 'cae', 'caída', 'eliminado'];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectThemes(text: string) {
  const normalized = normalizeText(text);
  return THEME_MAP
    .filter((theme) => theme.keywords.some((keyword) => normalized.includes(normalizeText(keyword))))
    .map((theme) => theme.label);
}

function detectTone(items: Pick<NewsItem, 'title' | 'contentSnippet'>[]) {
  let positive = 0;
  let negative = 0;

  for (const item of items) {
    const text = normalizeText(`${item.title} ${item.contentSnippet || ''}`);
    if (POSITIVE_WORDS.some((word) => text.includes(normalizeText(word)))) positive++;
    if (NEGATIVE_WORDS.some((word) => text.includes(normalizeText(word)))) negative++;
  }

  if (negative > positive) return 'Atento';
  if (positive > negative) return 'Positivo';
  return 'Mixto';
}

function countRecentNews(items: Pick<NewsItem, 'published'>[], days = 7) {
  const now = Date.now();
  const maxAge = 1000 * 60 * 60 * 24 * days;
  return items.filter((item) => {
    const published = new Date(item.published).getTime();
    return Number.isFinite(published) && now - published <= maxAge;
  }).length;
}

function detectMomentum(items: Pick<NewsItem, 'published'>[]) {
  const recentCount = countRecentNews(items, 7);
  if (recentCount >= 4) return 'Alta';
  if (recentCount >= 2) return 'Media';
  return 'Baja';
}

function detectEditorialBadge(
  tone: AnalystCard['tone'],
  momentum: AnalystCard['momentum'],
  themes: string[],
): AnalystCard['editorialBadge'] {
  if (tone === 'Atento' || themes.includes('Lesiones')) return 'En alerta';
  if (momentum === 'Alta' && tone === 'Positivo') return 'En ascenso';
  if (momentum === 'Alta') return 'Ruido alto';
  return 'Plantel estable';
}

function buildSignals(
  themes: string[],
  tone: AnalystCard['tone'],
  momentum: AnalystCard['momentum'],
  recentNewsCount: number,
  latestPublished: string,
  editorialBadge: AnalystCard['editorialBadge'],
) {
  const signals: AnalystSignal[] = [
    { label: 'Ritmo', value: `${momentum} · ${recentNewsCount} recientes` },
    { label: 'Lectura', value: tone },
    { label: 'Foco', value: themes[0] || 'Panorama general' },
    { label: 'Badge', value: editorialBadge },
  ];

  const published = new Date(latestPublished).getTime();
  if (Number.isFinite(published)) {
    const hours = Math.floor((Date.now() - published) / 3600000);
    signals.push({ label: 'Último corte', value: hours < 24 ? `${Math.max(hours, 1)}h` : `${Math.floor(hours / 24)}d` });
  }

  return signals;
}

function buildStrengths(themes: string[], tone: AnalystCard['tone'], momentum: AnalystCard['momentum']) {
  const strengths: string[] = [];
  if (themes.includes('Ataque')) strengths.push('ataque en foco');
  if (themes.includes('Figura')) strengths.push('figuras activas');
  if (themes.includes('Preparación')) strengths.push('preparación en marcha');
  if (tone === 'Positivo') strengths.push('tono favorable');
  if (momentum === 'Alta') strengths.push('ritmo alto');
  return strengths.slice(0, 2);
}

function buildRisks(themes: string[], tone: AnalystCard['tone']) {
  const risks: string[] = [];
  if (themes.includes('Lesiones')) risks.push('bajas o dudas físicas');
  if (themes.includes('Entrenador')) risks.push('banquillo bajo lupa');
  if (themes.includes('Convocatoria')) risks.push('lista aún abierta');
  if (tone === 'Atento') risks.push('señales de cautela');
  return risks.slice(0, 2);
}

function buildAnalysis(
  teamName: string,
  tone: AnalystCard['tone'],
  momentum: AnalystCard['momentum'],
  themes: string[],
  newsCount: number,
  recentNewsCount: number,
  editorialBadge: AnalystCard['editorialBadge'],
) {
  const themeText = themes[0]?.toLowerCase() || 'panorama general';
  const toneText =
    tone === 'Positivo'
      ? 'tono favorable'
      : tone === 'Atento'
        ? 'lectura cauta'
        : 'lectura mixta';

  const momentumText =
    momentum === 'Alta'
      ? 'ritmo alto'
      : momentum === 'Media'
        ? 'ritmo sostenido'
        : 'ritmo bajo';

  return `${teamName} aparece ${editorialBadge.toLowerCase()} con ${toneText}. Registra ${recentNewsCount} notas recientes y ${newsCount} en total, con ${themeText} como foco y ${momentumText} en el radar.`;
}

function calculateTrendScore(newsCount: number, recentNewsCount: number, momentum: AnalystCard['momentum'], tone: AnalystCard['tone']) {
  const momentumScore = momentum === 'Alta' ? 30 : momentum === 'Media' ? 20 : 10;
  const toneScore = tone === 'Positivo' ? 6 : tone === 'Mixto' ? 4 : 5;
  return newsCount * 4 + recentNewsCount * 6 + momentumScore + toneScore;
}

export function buildAnalystCards(
  teams: CollectionEntry<'teams'>[],
  news: NewsItem[],
  limit = 12,
): AnalystCard[] {
  const teamMap = new Map(teams.map((team) => [team.data.id, team]));
  const grouped = new Map<string, NewsItem[]>();

  for (const item of news) {
    if (!item.teamId || item.playerId) continue;
    if (!teamMap.has(item.teamId)) continue;
    const current = grouped.get(item.teamId) || [];
    const duplicate = current.some((entry) => entry.url === item.url || entry.title === item.title);
    if (!duplicate) current.push(item);
    grouped.set(item.teamId, current);
  }

  return Array.from(grouped.entries())
    .map(([teamId, items]) => {
      const team = teamMap.get(teamId)!;
      const sortedItems = items
        .filter((item) => item.title)
        .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

      const combinedText = sortedItems
        .slice(0, 8)
        .map((item) => `${item.title} ${item.contentSnippet || ''}`)
        .join(' ');

      const themeSet = new Set(detectThemes(combinedText));
      if (themeSet.size === 0) themeSet.add('Panorama');

      const themes = Array.from(themeSet).slice(0, 3);
      const latestPublished = sortedItems[0]?.published || new Date().toISOString();
      const momentum = detectMomentum(sortedItems);
      const tone = detectTone(sortedItems);
      const recentNewsCount = countRecentNews(sortedItems, 7);
      const trendScore = calculateTrendScore(sortedItems.length, recentNewsCount, momentum, tone);
      const editorialBadge = detectEditorialBadge(tone, momentum, themes);
      const signals = buildSignals(themes, tone, momentum, recentNewsCount, latestPublished, editorialBadge);
      const strengths = buildStrengths(themes, tone, momentum);
      const risks = buildRisks(themes, tone);

      const previousWindowCount = Math.max(sortedItems.length - recentNewsCount, 0);
      const trendDelta = recentNewsCount - previousWindowCount;
      const trendDirection = trendDelta > 0 ? '↗' : trendDelta < 0 ? '↘' : '→';

      // Build 7-day daily activity buckets (oldest → today)
      const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const now = new Date();
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const offsetDays = 6 - i; // 6 days ago → today
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - offsetDays);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = dayStart.getTime() + 86400000;
        const count = sortedItems.filter((item) => {
          const t = new Date(item.published).getTime();
          return Number.isFinite(t) && t >= dayStart.getTime() && t < dayEnd;
        }).length;
        const label = offsetDays === 0 ? 'HOY' : DAY_LABELS[dayStart.getDay()];
        return { label, value: count };
      });

      return {
        teamId,
        teamName: team.data.name,
        code: team.data.code,
        flag: team.data.flag,
        group: team.data.group,
        continent: team.data.continent,
        qualified: team.data.qualified,
        latestHeadline: sortedItems[0]?.title || `Pulso reciente de ${team.data.name}`,
        latestPublished,
        newsCount: sortedItems.length,
        recentNewsCount,
        trendScore,
        momentum,
        tone,
        editorialBadge,
        themes,
        signals,
        strengths,
        risks,
        analysis: buildAnalysis(team.data.name, tone, momentum, themes, sortedItems.length, recentNewsCount, editorialBadge),
        headlines: sortedItems.slice(0, 3).map((item) => ({
          title: item.title,
          url: item.url,
          source: item.source,
          published: item.published,
          id: item.id,
        })),
        trendLine: dailyActivity,
        trendDirection: trendDirection as '↗' | '↘' | '→',
      } satisfies AnalystCard;
    })
    .sort((a, b) => {
      if (b.trendScore !== a.trendScore) return b.trendScore - a.trendScore;
      return new Date(b.latestPublished).getTime() - new Date(a.latestPublished).getTime();
    })
    .slice(0, limit);
}

export function buildAnalystComparison(left: AnalystCard, right: AnalystCard): AnalystComparison {
  const leftLead = left.trendScore - right.trendScore;
  const stronger = left.trendScore >= right.trendScore ? left.teamName : right.teamName;
  const summary = `${stronger} llega mejor en el corte reciente. La diferencia es de ${Math.abs(leftLead)} puntos y el cruce enfrenta ${left.editorialBadge.toLowerCase()} contra ${right.editorialBadge.toLowerCase()}.`;

  const advantages = [
    `${left.teamName}: ${left.strengths[0] || 'perfil estable'}`,
    `${right.teamName}: ${right.strengths[0] || 'perfil estable'}`,
    `${left.themes[0] || 'Panorama'} vs ${right.themes[0] || 'Panorama'}`,
  ];

  return { left, right, summary, advantages };
}

export function buildAnalystTiers(cards: AnalystCard[]): AnalystTier[] {
  const sorted = [...cards].sort((a, b) => b.trendScore - a.trendScore);
  return [
    {
      title: 'Favoritos del radar',
      description: 'Selecciones con mejor mezcla de tendencia, tono y ritmo reciente.',
      teams: sorted.slice(0, 4),
    },
    {
      title: 'Tapados en ascenso',
      description: 'Proyectos con señales positivas y margen para seguir escalando.',
      teams: sorted.filter((card) => card.editorialBadge === 'En ascenso' || card.tone === 'Positivo').slice(0, 4),
    },
    {
      title: 'Zona de vigilancia',
      description: 'Equipos con narrativa sensible o temas que exigen seguimiento cercano.',
      teams: sorted.filter((card) => card.editorialBadge === 'En alerta' || card.risks.length > 0).slice(0, 4),
    },
  ].filter((tier) => tier.teams.length > 0);
}

export function buildAnalystForecastBoards(cards: AnalystCard[]): AnalystForecastBoard[] {
  const sorted = [...cards].sort((a, b) => b.trendScore - a.trendScore);
  return [
    {
      title: 'Semifinalistas del radar',
      description: 'Las cuatro selecciones con contexto mediático más fuerte en este corte.',
      teams: sorted.slice(0, 4),
    },
    {
      title: 'Caballos negros',
      description: 'Equipos con señales competitivas positivas sin dominar todavía la conversación.',
      teams: sorted.filter((card) => card.editorialBadge === 'En ascenso' && card.trendScore < (sorted[0]?.trendScore || 999)).slice(0, 4),
    },
  ].filter((board) => board.teams.length > 0);
}

export function buildAnalystEditorialSummary(cards: AnalystCard[]): AnalystEditorialSummary | null {
  if (cards.length === 0) return null;
  const sorted = [...cards].sort((a, b) => b.trendScore - a.trendScore);
  const leader = sorted[0];
  const alert = sorted.find((card) => card.editorialBadge === 'En alerta' || card.tone === 'Atento');
  const riser = sorted.find((card) => card.editorialBadge === 'En ascenso' && card.teamId !== leader.teamId) || sorted[1];

  return {
    headline: `${leader.teamName} lidera el radar`,
    summary: `${leader.teamName} suma ${leader.trendScore} puntos. ${riser ? `${riser.teamName} sube.` : ''} ${alert ? `${alert.teamName} queda bajo atención.` : ''}`.trim(),
    highlights: [
      `${leader.teamName}: ${leader.editorialBadge.toLowerCase()}`,
      riser ? `${riser.teamName}: ${riser.trendDirection} ${riser.trendScore} pts` : '',
      alert ? `${alert.teamName}: alerta` : '',
    ].filter(Boolean),
  };
}
