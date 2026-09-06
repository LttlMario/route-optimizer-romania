import { listCompletedStops, clearCompletedStops } from './storage.js';
const KEY = 'route-optimizer-completed-v1'; const list = document.querySelector('#history-list'); const empty = document.querySelector('#empty-history');
async function readHistory() { const indexed = await listCompletedStops(); if (indexed.length) return indexed; try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
async function render() { const history = await readHistory(); list.innerHTML = ''; empty.hidden = history.length > 0; history.slice().reverse().forEach((stop) => { const item = document.createElement('li'); const date = stop.deliveredAt ? new Date(stop.deliveredAt).toLocaleString('ro-RO') : ''; item.innerHTML = `<strong>${stop.input || stop.display_name}</strong><small>${stop.statusLabel || 'Livrat'} · ${date}</small>${stop.note ? `<small>Notiță: ${stop.note}</small>` : ''}`; list.append(item); }); }
document.querySelector('#clear-history').addEventListener('click', async () => { if (confirm('Ștergi tot istoricul local?')) { localStorage.removeItem(KEY); await clearCompletedStops(); render(); } }); render();


