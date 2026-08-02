import { enabledStorage } from '@/utils/storage';

export default defineBackground(() => {
  // Ensure default storage values are initialized
  enabledStorage.getValue().then((val: boolean | null) => {
    if (val === null || val === undefined) {
      enabledStorage.setValue(true);
    }
  });
});
