// Minimal progressive enhancement; the homepage remains navigable without JS.
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#main-menu');
function setMenu(open){menu.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
menu?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus()}});
const search=document.querySelector('#hub-search');const cards=[...document.querySelectorAll('[data-search]')];const empty=document.querySelector('#search-empty');
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
search?.addEventListener('input',()=>{const value=normalize(search.value.trim());let matches=0;cards.forEach(card=>{const show=normalize(card.dataset.search).includes(value);card.hidden=!show;if(show)matches++});empty.hidden=matches>0});

// Calendar countdown to midnight Paris time, not a promise of regional unlock time.
const countdown=document.querySelector('#countdown');const countdownValue=document.querySelector('#countdown-value');
function tick(){if(!countdown)return;const remaining=Date.parse('2026-11-19T00:00:00+01:00')-Date.now();if(remaining<=0){countdown.hidden=true;return}const s=Math.floor(remaining/1000);countdownValue.textContent=`${Math.floor(s/86400)} J  ${String(Math.floor(s%86400/3600)).padStart(2,'0')} H  ${String(Math.floor(s%3600/60)).padStart(2,'0')} MIN  ${String(s%60).padStart(2,'0')} S`;countdown.hidden=false}if(countdown){tick();setInterval(tick,1000);}
