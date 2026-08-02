# 🎬 ForceNetflix4K

[![WXT Framework](https://img.shields.io/badge/Framework-WXT-6366f1.style=flat-square)](https://wxt.dev)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub Actions Release](https://img.shields.io/badge/Release-GitHub%20Actions-green?style=flat-square&logo=githubactions)](https://github.com/)

**ForceNetflix4K** is a lightweight browser extension for Chromium and Firefox that spoofs browser resolution, User-Agent, and media capability reporting to unlock 4K Ultra HD streaming profiles on Netflix.

---

> [!IMPORTANT]  
> **What This Extension Does (and Does NOT) Do**  
> Spoofing browser metrics is **ONLY ONE** of several strict prerequisites Netflix enforces to deliver 4K streams. This extension bypasses browser-side screen dimension and capability checks, but **it cannot bypass hardware or DRM requirements** (such as HEVC GPU decoding or HDCP 2.2 protection).

---

## 📋 Netflix 4K UHD Requirements Breakdown

To stream Netflix in 4K Ultra HD, your environment must satisfy **all** of the following conditions. Here is how **ForceNetflix4K** interacts with them:

| Requirement | Description | Bypassed by ForceNetflix4K? |
| :--- | :--- | :---: |
| 💳 **Netflix Premium Plan** | An active subscription tier supporting Ultra HD (4K). | ❌ **No** *(Account level)* |
| 💻 **Hardware / GPU Decoding** | GPU hardware acceleration supporting HEVC (H.265) / AV1 decoding. | ❌ **No** *(Hardware level)* |
| 🔐 **HDCP 2.2 Display Chain** | Graphics card, monitor, and cables must all support HDCP 2.2. | ❌ **No** *(DRM / OS level)* |
| 🖥️ **4K Screen / Viewport (3840×2160)** | Screen resolution reported to the browser must be 4K UHD or scaled high DPI. | ✅ **YES** *(Spoofed by Extension)* |
| 🌐 **Supported Browser & User-Agent** | Edge/Safari or Windows PlayReady browser detection for 4K profiles. | ✅ **YES** *(Spoofed by Extension)* |
| 📼 **MediaCapabilities & Codec API** | Browser reporting `supported: true` for 4K HEVC/AV1 video decoding. | ✅ **YES** *(Spoofed by Extension)* |

---

## ⚡ What ForceNetflix4K Bypasses

When visiting `netflix.com`, the extension injects scripts into the main document context at `document_start` to perform the following:

1. **User-Agent & Platform Spoofing**: Spoofs the browser environment to report as **Microsoft Edge on Windows 10**, triggering Netflix's PlayReady 4K video profile selector.
2. **Screen & Viewport Dimensions**: Intercepts `window.screen`, `Screen.prototype`, `innerWidth`, `innerHeight`, and `devicePixelRatio` to present a 3840×2160 (4K UHD) display to Netflix scripts.
3. **Media Query Interception**: Wraps `window.matchMedia` to return positive matches for `min-width`, `min-device-width`, and `min-resolution` queries up to 4K.
4. **MediaCapabilities & MediaSource Overrides**: Hooks `MediaCapabilities.prototype.decodingInfo` and `MediaSource.isTypeSupported` so Netflix's player detects full support for 4K UHD resolutions and modern codecs (`hev1`, `av01`, `vp09`).

---

## ⚠️ The HDCP 2.2 & Multi-Monitor Problem

A common reason users fail to get 4K—even when using this extension—is **HDCP (High-bandwidth Digital Content Protection)** compliance across multi-monitor setups.

> [!WARNING]  
> **How HDCP Multi-Monitor Enforcement Works:**  
> Netflix uses hardware-level DRM (**Microsoft PlayReady SL3000** or **Google Widevine L1**) via the operating system and GPU driver. Before serving a 4K stream, the DRM engine verifies the entire display chain.  
> 
> **If ANY connected monitor lacks HDCP 2.2 support** (e.g., an older secondary 1080p display, a DVI/VGA adapter, or a non-compliant HDMI cable), the OS DRM system will flag the display chain as unsecure and force Netflix to fallback to 1080p or 720p. **No browser extension can override this OS/DRM hardware block.**

### 💡 How to Fix HDCP / Multi-Monitor Fallback:
1. **Disable Secondary Displays During Playback**:
   * On Windows, press <kbd>Win</kbd> + <kbd>P</kbd> and select **"PC screen only"** (or select only your primary 4K display).
   * Disconnecting non-HDCP 2.2 monitors from the display topology restores the secure HDCP 2.2 chain.
2. **Check Connectors & Cables**:
   * Ensure your 4K monitor is connected directly to your GPU via **HDMI 2.0+** or **DisplayPort 1.4+** cables rated for HDCP 2.2.
3. **Hardware Splitters**:
   * Some active HDMI 2.0 splitters/converters with EDID management can sanitize HDCP handshakes across mixed-resolution displays.

---

## 🚀 Release Process (Automated via GitHub Actions)

Releases in this repository are **fully automated**. Do **not** manually create git tags, run local release zip scripts, or draft GitHub releases on your machine.

All releases are handled by the **[Manual Release GitHub Action workflow](.github/workflows/release.yml)**.

### How to Trigger a Release:

1. Navigate to the **Actions** tab in the GitHub repository.
2. Under **Workflows**, select **Manual Release**.
3. Click **Run workflow**.
4. Fill in the required inputs:
   * **Version number**: Provide the semantic version (e.g., `1.0.1` or `1.1.0`).
   * **Optional release notes**: Add custom release notes (if left blank, GitHub will auto-generate them).
5. Click **Run workflow**.

### What the Release Action Does Automatically:
* 🔍 Validates that the requested version is valid and strictly greater than the current `package.json` version.
* 📦 Bumps the version in `package.json` and `package-lock.json`.
* 🧪 Runs linting (`biome lint`) and typechecks (`vue-tsc`).
* 🗜️ Builds zipped web extension artifacts for both **Chromium** and **Firefox** using WXT (`npm run zip` and `npm run zip:firefox`).
* 🏷️ Commits the version bump, creates the Git tag (`vX.Y.Z`), and pushes them to GitHub.
* 🎁 Publishes an official **GitHub Release** with the compiled Chrome and Firefox `.zip` packages attached.

---

## 🛠️ Local Development & Building

### Prerequisites
* **Node.js**: v20 or later
* **npm**: v10 or later

### Commands

```bash
# Install dependencies
npm install

# Start development mode with hot-reloading (Chrome)
npm run dev

# Start development mode for Firefox
npm run dev:firefox

# Typecheck and lint
npm run lint
npm run typecheck

# Production build
npm run build

# Build zipped packages locally for testing
npm run zip
npm run zip:firefox
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
