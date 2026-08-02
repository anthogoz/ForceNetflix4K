import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module'],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['storage', 'activeTab', 'tabs'],
    host_permissions: ['*://*.netflix.com/*'],
    web_accessible_resources: [
      {
        resources: ['icon/16.png', 'icon/48.png', 'icon/128.png'],
        matches: ['*://*.netflix.com/*'],
      },
    ],
    // Required by Firefox to load the extension without "corrupted" error.
    browser_specific_settings: {
      gecko: {
        id: 'force-netflix-4k@lnkhey',
        strict_min_version: '140.0',
        data_collection_permissions: {
          required: ['none'],
          optional: [],
        },
      } as any,
    },
  },
});
