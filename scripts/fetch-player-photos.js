import fs from 'fs';
import path from 'path';

const playersFilePath = path.join(process.cwd(), 'src', 'content', 'players', 'data.json');
const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));

async function fetchWikipediaImage(playerName) {
  try {
    // 1. Search for the player
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName + ' futbol')}&utf8=&format=json`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData.query && searchData.query.search.length > 0) {
      const title = searchData.query.search[0].title;
      
      // 2. Get the page image
      const imageUrl = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=640`;
      const imageRes = await fetch(imageUrl);
      const imageData = await imageRes.json();
      
      const pages = imageData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch (err) {
    console.error(`Error fetching for ${playerName}`, err.message);
  }
  return null;
}

async function run() {
  console.log('Fetching photos for players...');
  for (const player of playersData) {
    if (!player.photo || player.photo.includes('example.com') || player.photo.includes('ui-avatars.com')) {
      console.log(`Getting photo for ${player.name}...`);
      const photoUrl = await fetchWikipediaImage(player.name);
      if (photoUrl) {
        player.photo = photoUrl;
        console.log(`Found: ${photoUrl}`);
      } else {
        console.log(`No photo found for ${player.name}`);
        // fallback to a robust placeholder like ui-avatars
        player.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=200`;
      }
      // Small delay to be polite to Wikipedia API
      await new Promise(r => setTimeout(r, 200));
    }
  }

  fs.writeFileSync(playersFilePath, JSON.stringify(playersData, null, 2));
  console.log('Updated players data with actual photos.');
}

run();
