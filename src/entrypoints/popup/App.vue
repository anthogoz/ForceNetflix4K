<template>
  <div class="popup-container">
    <!-- Extension Header -->
    <header class="header">
      <img src="/icon/48.png" alt="Logo" class="header-icon" />
      <div class="header-text">
        <h1>{{ $t('title') }}</h1>
        <p>{{ $t('subtitle') }}</p>
      </div>
    </header>

    <!-- Main Card -->
    <main class="card">
      <div class="toggle-row">
        <div class="toggle-info">
          <span class="title">{{ $t('toggleLabel') }}</span>
          <span class="status-badge" :class="isEnabled ? 'active' : 'disabled'">
            <span class="dot"></span>
            {{ isEnabled ? $t('statusActive') : $t('statusDisabled') }}
          </span>
        </div>
        <ToggleSwitch v-model="isEnabled" @update:model-value="onToggleChange" />
      </div>

      <div class="description-box">
        <p v-if="isEnabled">{{ $t('activeDesc') }}</p>
        <p v-else>{{ $t('disabledDesc') }}</p>
      </div>

      <!-- Spoofing Parameters Overview -->
      <div v-if="isEnabled" class="params-grid">
        <div class="param-item">
          <span class="label">Resolution</span>
          <span class="val">3840 x 2160</span>
        </div>
        <div class="param-item">
          <span class="label">Device Pixel Ratio</span>
          <span class="val">2.0</span>
        </div>
      </div>
    </main>

    <!-- Footer Controls -->
    <footer class="footer">
      <div class="active-tab-info" :class="isNetflixTab ? 'is-netflix' : 'not-netflix'">
        <span class="dot"></span>
        <span>{{ isNetflixTab ? $t('activeTabNetflix') : $t('activeTabOther') }}</span>
      </div>

      <button v-if="isNetflixTab" class="refresh-btn" @click="reloadTab">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        {{ $t('refreshButton') }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { browser } from 'wxt/browser';
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import { enabledStorage } from '@/utils/storage';

const isEnabled = ref(true);
const isNetflixTab = ref(false);
const currentTabId = ref<number | null>(null);

onMounted(async () => {
  // Load storage state
  const storedVal = await enabledStorage.getValue();
  isEnabled.value = storedVal ?? true;

  // Check active tab
  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.url) {
      currentTabId.value = activeTab.id ?? null;
      isNetflixTab.value = activeTab.url.includes('netflix.com');
    }
  } catch (_e) {
    // Fallback if tabs permission is restricted
  }
});

async function onToggleChange(val: boolean) {
  await enabledStorage.setValue(val);
}

async function reloadTab() {
  if (currentTabId.value !== null) {
    await browser.tabs.reload(currentTabId.value);
  }
}
</script>
