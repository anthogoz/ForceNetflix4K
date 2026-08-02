export default defineContentScript({
  matches: ['*://*.netflix.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    // Check if spoofing is explicitly disabled via sessionStorage flag
    const isDisabled = sessionStorage.getItem('__force_netflix_4k_disabled__') === 'true';
    if (isDisabled) {
      return;
    }

    // 1. User-Agent & Platform Spoofing (Edge on Windows for PlayReady 4K profile)
    const edgeUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';

    try {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => edgeUA,
        configurable: true,
      });
      Object.defineProperty(navigator, 'appVersion', {
        get: () => edgeUA.replace('Mozilla/', ''),
        configurable: true,
      });
      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.',
        configurable: true,
      });
    } catch (_e) {
      // Ignore fallback errors
    }

    // 2. Screen Proxy & Prototype Overrides (3840x2160 4K UHD)
    const origScreen = window.screen;
    const screenProxy = new Proxy(origScreen, {
      get(target, prop) {
        if (prop === 'width' || prop === 'availWidth') return 3840;
        if (prop === 'height' || prop === 'availHeight') return 2160;
        if (prop === 'colorDepth' || prop === 'pixelDepth') return 24;
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
      },
    });

    try {
      Object.defineProperty(window, 'screen', {
        get: () => screenProxy,
        configurable: true,
        enumerable: true,
      });
    } catch (_e) {
      // Ignore fallback errors
    }

    const spoofedScreenProps: Record<string, number> = {
      width: 3840,
      height: 2160,
      availWidth: 3840,
      availHeight: 2160,
      colorDepth: 24,
      pixelDepth: 24,
    };

    for (const [prop, val] of Object.entries(spoofedScreenProps)) {
      try {
        Object.defineProperty(Screen.prototype, prop, {
          get: () => val,
          configurable: true,
          enumerable: true,
        });
      } catch (_e) {
        // Ignore fallback errors
      }
    }

    // 3. Viewport & Window Dimensions (3840x2160 & DPR 2)
    const windowProps: Record<string, number> = {
      devicePixelRatio: 2,
      outerWidth: 3840,
      outerHeight: 2160,
      innerWidth: 3840,
      innerHeight: 2160,
    };

    for (const [prop, val] of Object.entries(windowProps)) {
      try {
        Object.defineProperty(window, prop, {
          get: () => val,
          configurable: true,
          enumerable: true,
        });
      } catch (_e) {
        // Ignore fallback errors
      }
    }

    // 4. Media Query (matchMedia) Spoofing
    try {
      const origMatchMedia = window.matchMedia;
      window.matchMedia = (query: string): MediaQueryList => {
        const mql = origMatchMedia.call(window, query);
        if (
          query &&
          /min-width|min-device-width|min-resolution|device-pixel-ratio/i.test(query)
        ) {
          const widthMatch = query.match(/min-(?:device-)?width:\s*(\d+)px/i);
          if (widthMatch) {
            const reqWidth = parseInt(widthMatch[1], 10);
            if (reqWidth <= 3840) {
              return new Proxy(mql, {
                get(target, prop) {
                  if (prop === 'matches') return true;
                  const val = Reflect.get(target, prop);
                  return typeof val === 'function' ? val.bind(target) : val;
                },
              });
            }
          }

          const resMatch = query.match(/min-resolution:\s*(\d+(?:\.\d+)?)dppx/i);
          if (resMatch) {
            const reqRes = parseFloat(resMatch[1]);
            if (reqRes <= 2) {
              return new Proxy(mql, {
                get(target, prop) {
                  if (prop === 'matches') return true;
                  const val = Reflect.get(target, prop);
                  return typeof val === 'function' ? val.bind(target) : val;
                },
              });
            }
          }
        }
        return mql;
      };
    } catch (_e) {
      // Ignore matchMedia fallback errors
    }

    // 5. MediaCapabilities & MediaSource Overrides
    try {
      const origDecodingInfo = MediaCapabilities.prototype.decodingInfo;
      MediaCapabilities.prototype.decodingInfo = function (config) {
        return origDecodingInfo
          .call(this, config)
          .then((result) => {
            if (config?.video) {
              return {
                ...result,
                supported: true,
                smooth: true,
                powerEfficient: true,
              };
            }
            return result;
          })
          .catch(() => {
            if (config?.video) {
              return {
                supported: true,
                smooth: true,
                powerEfficient: true,
                keySystemAccess: null,
              };
            }
            return { supported: false, smooth: false, powerEfficient: false, keySystemAccess: null };
          });
      };
    } catch (_e) {
      // Ignore fallback errors
    }

    try {
      const origIsTypeSupported = MediaSource.isTypeSupported;
      MediaSource.isTypeSupported = (type: string): boolean => {
        if (
          type &&
          (type.includes('3840') ||
            type.includes('2160') ||
            type.includes('av01') ||
            type.includes('vp09') ||
            type.includes('hev1'))
        ) {
          return true;
        }
        return origIsTypeSupported.call(MediaSource, type);
      };
    } catch (_e) {
      // Ignore fallback errors
    }

    // Listen for live toggle updates from the extension context
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'FORCE_NETFLIX_4K_TOGGLE') {
        if (event.data.enabled === false) {
          sessionStorage.setItem('__force_netflix_4k_disabled__', 'true');
        } else {
          sessionStorage.removeItem('__force_netflix_4k_disabled__');
        }
      }
    });
  },
});
