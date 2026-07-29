// Strumenti in campo · gestione PWA condivisa da tutte le pagine:
// installazione, aggiornamenti, versione, pannello Impostazioni.
(function () {
  'use strict';

  // ---------- stile del banner (una sola definizione per tutte le pagine) ----------
  const css = `
  .pwa-banner {
    position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 60;
    max-width: 696px; margin: 0 auto;
    background: #3D2F1F; color: #F5F1EA;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; font-size: 12px; line-height: 1.4;
    box-shadow: 0 6px 16px rgba(61,47,31,0.35);
  }
  .pwa-banner-btn {
    flex-shrink: 0; background: #F5F1EA; color: #3D2F1F; border: none;
    padding: 8px 12px; font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; cursor: pointer;
  }
  .pwa-banner-close {
    flex-shrink: 0; background: none; border: none; color: #F5F1EA;
    opacity: 0.7; font-size: 14px; cursor: pointer; padding: 4px;
  }`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- preferenze ----------
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const installBannerLetto = () => ls.get('strumenti-install-ok') === '1';
  const autoUpdateOn = () => ls.get('auto-update') !== 'off';
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const installata = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                     navigator.standalone === true;

  // ---------- banner ----------
  function banner(msg, btnLabel, onBtn, isInstall) {
    const bar = document.createElement('div');
    bar.className = 'pwa-banner';
    // se la pagina ha la barra azioni fissa in basso, il banner le sta sopra
    if (document.getElementById('action-bar')) {
      bar.style.bottom = 'calc(96px + env(safe-area-inset-bottom, 0px))';
    }
    const span = document.createElement('span');
    span.style.flex = '1';
    span.textContent = msg;
    bar.appendChild(span);
    if (btnLabel) {
      const b = document.createElement('button');
      b.className = 'pwa-banner-btn';
      b.textContent = btnLabel;
      b.onclick = () => { bar.remove(); if (onBtn) onBtn(); };
      bar.appendChild(b);
    }
    const x = document.createElement('button');
    x.className = 'pwa-banner-close';
    x.textContent = '\u2715';
    x.setAttribute('aria-label', 'Chiudi');
    x.onclick = () => { bar.remove(); if (isInstall) ls.set('strumenti-install-ok', '1'); };
    bar.appendChild(x);
    document.body.appendChild(bar);
    return bar;
  }

  // ---------- installazione ----------
  let promptInstall = null;
  if (!installata) {
    const link = document.getElementById('install-link');
    if (link) link.style.display = 'inline-block';
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();               // su Android il prompt nativo parte a richiesta
      promptInstall = e;
      if (!installBannerLetto()) {
        banner("Installa l'app sulla schermata Home", 'Installa', () => e.prompt(), true);
      }
    });
    if (isIOS() && !installBannerLetto()) {
      banner('Per installare: Condividi \u2192 "Aggiungi alla schermata Home"', null, null, true);
    }
  }

  // il pulsante nel footer resta disponibile anche dopo aver chiuso il banner
  window.installaApp = function () {
    if (promptInstall) promptInstall.prompt();
    else if (isIOS()) banner('Su iPhone: Condividi \u2192 "Aggiungi alla schermata Home"', null, null, false);
    else banner('Dal menu \u22ee di Chrome scegli "Installa app" o "Aggiungi a schermata Home"', null, null, false);
  };

  // ---------- aggiornamenti ----------
  let reg = null;
  let updateReady = false;
  let bannerAggiornamento = null;

  function applica(r) {
    const w = (r || reg) && ((r || reg).waiting || (r || reg).installing);
    if (w) w.postMessage({ type: 'SKIP_WAITING' });
  }

  // Una nuova versione è pronta: la si applica subito solo se l'utente ha
  // lasciato attivi gli aggiornamenti automatici, altrimenti aspetta il suo via.
  // Ricaricare la pagina sotto le mani di chi sta lavorando in campo non è gratis.
  function nuovaVersionePronta() {
    updateReady = true;
    const apply = document.getElementById('set-apply');
    if (apply) apply.style.display = 'block';
    if (autoUpdateOn()) {
      applica();
    } else if (!bannerAggiornamento) {
      bannerAggiornamento = banner('Nuova versione disponibile', 'Aggiorna', () => applica(), false);
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(r => {
      reg = r;
      if (r.waiting && navigator.serviceWorker.controller) nuovaVersionePronta();
      r.addEventListener('updatefound', () => {
        const nuovo = r.installing;
        if (!nuovo) return;
        nuovo.addEventListener('statechange', () => {
          if (nuovo.state === 'installed' && navigator.serviceWorker.controller) nuovaVersionePronta();
        });
      });
      r.update();
      leggiVersione().then(mostraVersione);
    }).catch(() => {});

    let ricaricata = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!ricaricata) { ricaricata = true; location.reload(); }
    });
  }

  // ---------- versione ----------
  // Unica fonte: il service worker attivo. Nessun numero scritto a mano nelle pagine.
  async function leggiVersione() {
    if (!('serviceWorker' in navigator)) return null;
    let sw = navigator.serviceWorker.controller;
    if (!sw) {
      // primo avvio: il worker c'e' ma non controlla ancora questa pagina
      try {
        const r = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise(res => setTimeout(() => res(null), 1500))
        ]);
        sw = r && (r.active || r.waiting);
      } catch (e) { sw = null; }
    }
    if (!sw) return null;
    return new Promise(resolve => {
      const ch = new MessageChannel();
      ch.port1.onmessage = e => resolve(e.data && e.data.version);
      try { sw.postMessage({ type: 'GET_VERSION' }, [ch.port2]); } catch (e) { resolve(null); }
      setTimeout(() => resolve(null), 1000);
    });
  }
  function fmtVer(v) { return v ? v.replace('strumenti-', 'v') : '\u2014'; }
  function mostraVersione(v) {
    for (const el of document.querySelectorAll('[data-app-version]')) el.textContent = fmtVer(v);
  }

  // ---------- pannello impostazioni (solo dove esiste) ----------
  const modal = document.getElementById('settings-modal');

  window.openSettings = async function () {
    if (!modal) return;
    modal.classList.add('open');
    document.getElementById('auto-sw').checked = autoUpdateOn();
    const st2 = document.getElementById('set-status');
    st2.textContent = ''; st2.className = 'set-status';
    document.getElementById('set-apply').style.display = updateReady ? 'block' : 'none';
    const vEl = document.getElementById('set-version');
    vEl.textContent = 'lettura\u2026';
    vEl.textContent = fmtVer(await leggiVersione());
  };

  window.closeSettings = function () { if (modal) modal.classList.remove('open'); };

  window.toggleAutoUpdate = function (on) {
    ls.set('auto-update', on ? 'on' : 'off');
    if (on && updateReady) applica();
  };

  window.checkUpdate = async function () {
    const st2 = document.getElementById('set-status');
    const btn = document.getElementById('set-check');
    if (!navigator.onLine) {
      st2.className = 'set-status';
      st2.textContent = 'Nessuna connessione: riprova quando sei online.';
      return;
    }
    if (!reg) { st2.textContent = 'Aggiornamenti non disponibili.'; return; }
    btn.disabled = true;
    st2.className = 'set-status';
    st2.textContent = 'Controllo in corso\u2026';
    try {
      await reg.update();
      setTimeout(() => {
        if (reg.installing || reg.waiting || updateReady) {
          updateReady = true;
          st2.className = 'set-status new';
          st2.textContent = 'Aggiornamento disponibile.';
          document.getElementById('set-apply').style.display = 'block';
          if (autoUpdateOn()) applica();
        } else {
          st2.className = 'set-status ok';
          st2.textContent = 'Sei alla versione più recente.';
        }
        btn.disabled = false;
      }, 1200);
    } catch (e) {
      st2.className = 'set-status';
      st2.textContent = 'Verifica non riuscita. Riprova.';
      btn.disabled = false;
    }
  };

  window.applyUpdate = function () {
    applica();
    const st2 = document.getElementById('set-status');
    if (st2) st2.textContent = 'Aggiornamento in corso\u2026';
  };

  if (modal) {
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });
  }
})();
