# Sphoorthi Seva Trust — Progressive Web App (PWA)

Installable, offline-first Progressive Web App for **Sphoorthi Seva Trust (Reg: 402/2021)**.

## Highlights
- **Service Worker Caching**: Offline-first caching with `sw.js` supporting stale-while-revalidate for live APIs.
- **Installability**: Meets full Chrome/Safari PWA install criteria with `beforeinstallprompt` listener and custom install banner.
- **Graceful Offline Fallback**: Standalone `offline.html` with cached emergency contacts and helpline numbers when disconnected.
- **Web App Manifest**: Configured with splash colors, theme `#ea580c`, icons, and native OS app shortcuts.

## Project Structure
```text
pwa/
├── manifest.json                         # Web App Manifest & OS shortcut definitions
├── sw.js                                 # Service worker lifecycle & cache management
├── index.html                            # Standalone PWA entrypoint
├── offline.html                          # Offline emergency fallback screen
├── pwa-app.js                            # Install prompt trigger & live network tracker
├── package.json                          # Vite runner
└── README.md                             # Documentation
```
