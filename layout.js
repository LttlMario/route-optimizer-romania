(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const links = [
    ['index.html','⚙ Optimizare rută','optimizer'],
    ['routes.html','✓ Ruta curierului','routes'],
    ['saved.html','▤ Rute salvate','saved'],
    ['completed.html','▣ Stopuri finalizate','completed'],
    ['settings.html','⚙ Setări','settings']
  ];
  const active = links.find(([href]) => href === page)?.[2] || 'optimizer';
  const sidebarMarkup = '<div class="brand-mark">RO</div><strong class="brand-name">Route Optimizer</strong><nav class="sidebar-nav" aria-label="Navigare principală">' + links.map(([href,label,key]) => '<a class="nav-link ' + (key === active ? 'active' : '') + '" href="' + href + '">' + label + '</a>').join('') + '</nav><p class="sidebar-note">Salvare locală<br>OpenStreetMap</p>';
  document.querySelectorAll('.site-sidebar').forEach((node) => { node.innerHTML = sidebarMarkup; node.dataset.layoutMounted = 'true'; });
  if (!document.querySelector('.site-sidebar')) { const node=document.createElement('aside'); node.className='site-sidebar'; node.innerHTML=sidebarMarkup; node.dataset.layoutMounted='true'; document.body.prepend(node); }
  document.querySelectorAll('.site-footer').forEach((node) => { node.innerHTML = 'Route Optimizer România · OpenStreetMap contributors'; node.dataset.layoutMounted = 'true'; });
  if (!document.querySelector('.site-footer')) { const node=document.createElement('footer'); node.className='site-footer'; node.textContent='Route Optimizer România · OpenStreetMap contributors'; node.dataset.layoutMounted='true'; document.body.append(node); }
  document.querySelectorAll('header').forEach((node) => { node.classList.add('layout-header'); node.dataset.layoutMounted = 'true'; });
  document.documentElement.dataset.layoutMounted = 'true';
})();
