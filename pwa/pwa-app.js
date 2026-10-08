// PWA Client Runtime Engine for Sphoorthi Seva Trust
let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/pwa/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Service Worker registration failed:', err);
      });
  });
}

// Handle Install Banner Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) {
    installBanner.style.display = 'flex';
  }
});

// App logic
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User response to install:', outcome);
        deferredPrompt = null;
        document.getElementById('pwa-install-banner').style.display = 'none';
      }
    });
  }

  // Network Online/Offline status banner
  const updateOnlineStatus = () => {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      if (navigator.onLine) {
        statusEl.textContent = '🟢 Online • Live API Synced';
        statusEl.className = 'status-online';
      } else {
        statusEl.textContent = '🟠 Offline Mode • Using Cached Data';
        statusEl.className = 'status-offline';
      }
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Fetch live stats
  async function loadData() {
    try {
      const res = await fetch('/api/v1/donations');
      if (res.ok) {
        const data = await res.json();
        const el = document.getElementById('pwa-raised');
        if (el && data.totalSum) {
          el.textContent = '₹' + Math.round(data.totalSum).toLocaleString('en-IN');
        }
        const countEl = document.getElementById('pwa-donors');
        if (countEl && data.count) {
          countEl.textContent = data.count + ' Donors';
        }
      }
    } catch (e) {
      console.log('[PWA] Using cached offline stats');
    }
  }

  loadData();
});
