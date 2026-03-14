import PocketBase from 'pocketbase';
const pb = new PocketBase('https://futbolxp.pockethost.io');
pb.autoCancellation(false);
async function run() {
  await pb.collection('_superusers').authWithPassword('pegaso@agentmail.to', 'WiKCaJLJqdtXD65');
  const items = await pb.collection('news').getFullList(200);
  for (const item of items) {
    try {
        await pb.collection('news').delete(item.id);
    } catch (e) {
        console.log(`Failed to delete ${item.id}: ${e.message}`);
    }
  }
  console.log('Deleted ' + items.length + ' news (or attempted to)');
}
run();
