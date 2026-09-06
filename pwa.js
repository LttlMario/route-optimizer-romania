let deferredInstallPrompt = null;
let appRegistration = null;
let updateButton = null;
function addInstallButton() {
  const host = document.querySelector('.app-header, .route-header');
  if (!host || document.querySelector('#install-app')) return;
  const button = document.createElement('button');
  button.id = 'install-app'; button.className = 'install-app'; button.type = 'button'; button.textContent = 'Instalează aplicația'; button.hidden = true;
  host.append(button);
  button.addEventListener('click', async () => { if (!deferredInstallPrompt) return; deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt = null; button.hidden = true; });
}
function showUpdateButton(registration) {
  const host = document.querySelector('.app-header, .route-header');
  if (!host || updateButton) return;
  updateButton = document.createElement('button'); updateButton.id = 'update-app'; updateButton.className = 'update-app'; updateButton.type = 'button'; updateButton.textContent = 'Actualizează aplicația'; updateButton.title = 'Aplică ultima versiune când ești gata'; host.append(updateButton);
  updateButton.addEventListener('click', () => { updateButton.disabled = true; updateButton.textContent = 'Se actualizează…'; registration.waiting?.postMessage({ type: 'SKIP_WAITING' }); });
}
function watchRegistration(registration) {
  appRegistration = registration;
  if (registration.waiting) showUpdateButton(registration);
  registration.addEventListener('updatefound', () => { const worker = registration.installing; if (!worker) return; worker.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateButton(registration); }); });
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(watchRegistration).catch(() => {}); navigator.storage?.persist?.().catch(() => {}); });
navigator.serviceWorker?.addEventListener('controllerchange', () => { if (updateButton) window.location.reload(); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; addInstallButton(); const button = document.querySelector('#install-app'); if (button) button.hidden = false; });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; const button = document.querySelector('#install-app'); if (button) button.hidden = true; });
addInstallButton();
function updateNetworkStatus() { let badge = document.querySelector('#network-status'); if (!badge) { badge = document.createElement('span'); badge.id = 'network-status'; badge.className = 'network-status'; (document.querySelector('.app-header, .route-header') || document.body).append(badge); } badge.textContent = navigator.onLine ? 'Online' : 'Offline · mod local'; badge.classList.toggle('offline', !navigator.onLine); }
window.addEventListener('online', updateNetworkStatus); window.addEventListener('offline', updateNetworkStatus); updateNetworkStatus();
