import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://futbolxp.pockethost.io';

export const pb = new PocketBase(PB_URL);

// Disable auto-cancellation for parallel requests
pb.autoCancellation(false);

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string;
  teamId: string;
  teamName: string;
  playerId: string;
  contentSnippet: string;
  imageUrl: string;
  created: string;
  updated: string;
}

export async function getNewsByTeam(teamId: string, limit = 10): Promise<NewsItem[]> {
  try {
    const records = await pb.collection('news').getList<NewsItem>(1, limit, {
      filter: `teamId = "${teamId}" && playerId = ""`,
      sort: '-published',
    });
    return records.items;
  } catch (e) {
    console.error(`Error fetching news for team ${teamId}:`, e);
    return [];
  }
}

export async function getNewsByPlayer(playerId: string, limit = 10): Promise<NewsItem[]> {
  try {
    const records = await pb.collection('news').getList<NewsItem>(1, limit, {
      filter: `playerId = "${playerId}"`,
      sort: '-published',
    });
    return records.items;
  } catch (e) {
    console.error(`Error fetching news for player ${playerId}:`, e);
    return [];
  }
}

export async function getAllNews(page = 1, limit = 20): Promise<{ items: NewsItem[]; totalPages: number; totalItems: number }> {
  try {
    const records = await pb.collection('news').getList<NewsItem>(page, limit, {
      sort: '-published',
    });
    return {
      items: records.items,
      totalPages: records.totalPages,
      totalItems: records.totalItems,
    };
  } catch (e) {
    console.error('Error fetching all news:', e);
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

export async function getLatestNews(limit = 10): Promise<NewsItem[]> {
  try {
    const records = await pb.collection('news').getList<NewsItem>(1, limit, {
      sort: '-published',
    });
    return records.items;
  } catch (e) {
    console.error('Error fetching latest news:', e);
    return [];
  }
}
export async function getNewsCounts(): Promise<Record<string, number>> {
  try {
    // Fetch all news that have a playerId assigned
    const records = await pb.collection('news').getFullList<NewsItem>({
      filter: 'playerId != ""',
      fields: 'playerId'
    });

    const counts: Record<string, number> = {};
    records.forEach(news => {
      if (news.playerId) {
        counts[news.playerId] = (counts[news.playerId] || 0) + 1;
      }
    });

    return counts;
  } catch (e) {
    console.error('Error fetching news counts:', e);
    return {};
  }
}
