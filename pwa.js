let deferredInstallPrompt = null;
function addInstallButton() {
  const host = document.querySelector('.app-header, .route-header');
  if (!host || document.querySelector('#install-app')) return;
  const button = document.createElement('button');
  button.id = 'install-app';
  button.className = 'install-app';
  button.type = 'button';
  button.textContent = 'Instalează aplicația';
  button.hidden = true;
  host.append(button);
  button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    button.hidden = true;
  });
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); navigator.storage?.persist?.().catch(() => {}); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; addInstallButton(); const button = document.querySelector('#install-app'); if (button) button.hidden = false; });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; const button = document.querySelector('#install-app'); if (button) button.hidden = true; });
addInstallButton();
function updateNetworkStatus() { let badge = document.querySelector('#network-status'); if (!badge) { badge = document.createElement('span'); badge.id = 'network-status'; badge.className = 'network-status'; (document.querySelector('.app-header, .route-header') || document.body).append(badge); } badge.textContent = navigator.onLine ? 'Online' : 'Offline · mod local'; badge.classList.toggle('offline', !navigator.onLine); }
window.addEventListener('online', updateNetworkStatus); window.addEventListener('offline', updateNetworkStatus); updateNetworkStatus();
