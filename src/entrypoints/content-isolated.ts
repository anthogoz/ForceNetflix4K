import { enabledStorage } from '@/utils/storage';

export default defineContentScript({
  matches: ['*://*.netflix.com/*'],
  runAt: 'document_start',
  world: 'ISOLATED',
  main() {
    // Sync initial storage state to MAIN world
    enabledStorage.getValue().then((enabled: boolean) => {
      window.postMessage({ type: 'FORCE_NETFLIX_4K_TOGGLE', enabled }, '*');
    });

    // Watch for storage changes and notify MAIN world
    enabledStorage.watch((enabled: boolean) => {
      window.postMessage({ type: 'FORCE_NETFLIX_4K_TOGGLE', enabled }, '*');
    });
  },
});
