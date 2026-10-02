/*
 * Rillet cinematic scenes
 * Place the two packaged MP4s beside this HTML/CSS/JS trio.
 * The browser renders all type and controls; Runway footage is illustrative atmosphere.
 * To reuse inside another page, call window.RilletScenes.mount(root, { videoUrls: { heroics, close } }).
 */
(function () {
  'use strict';
  const layers = [
    { kicker: 'REPORTED LINE', value: '$4.28M', detail: 'The figure in the report. The question is what sits beneath it.' },
    { kicker: 'JOURNAL ENTRIES', value: '184 entries', detail: 'The entries that make up the reported line, available for review.' },
    { kicker: 'SOURCE EVENTS', value: 'Billing + bank', detail: 'The original activity behind the entries. Follow the trail back.' },
    { kicker: 'AGENT PROPOSAL', value: 'Policy applied', detail: 'The proposed treatment and the rule used to reach it.' },
    { kicker: 'HUMAN APPROVAL', value: 'Controller sign-off', detail: 'The accountable review and decision stay visible.' }
  ];
  const steps = [
    { kicker: '01 / SCOPE', title: 'Agree on the test.', detail: 'Choose a signed period, a controller sponsor, the inputs, and the definition of a successful tie-out.' },
    { kicker: '02 / REPLAY', title: 'Run it beside them.', detail: 'Process the agreed period in parallel. Keep the original close untouched.' },
    { kicker: '03 / TIE OUT', title: 'Compare the numbers.', detail: 'Put Rillet output next to the signed close. Record differences, exceptions, and time spent.' },
    { kicker: '04 / DECIDE', title: 'Let proof decide.', detail: 'Review the evidence with finance and the auditor. The controller makes the call.' }
  ];
  const defaults = { heroics: './heroics-ledger-monolith.mp4', close: './bring-your-last-close.mp4' };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(root, options = {}) {
    if (!root || root.dataset.rsMounted) return;
    root.dataset.rsMounted = 'true';
    const find = (selector) => root.querySelector(selector);
    const all = (selector) => [...root.querySelectorAll(selector)];
    const films = [find('#rs-film-heroics'), find('#rs-film-close')];
    const scenes = [find('#rs-scene-heroics'), find('#rs-scene-close')];
    const details = [find('#rs-proof-detail'), find('#rs-close-detail')];
    const index = find('#rs-index');
    const media = { ...defaults, ...(options.videoUrls || {}) };
    let scene = 0;
    let layer = 0;
    let step = 0;
    let motionPaused = reducedMotion;
    let openDetail = -1;
    let lastOpener = null;
    let wheelLockedUntil = 0;
    let touchStartX = null;

    films.forEach((film, i) => {
      film.src = i === 0 ? media.heroics : media.close;
      film.addEventListener('canplay', () => { film.classList.add('is-visible'); playActive(); });
      film.addEventListener('error', () => { film.classList.remove('is-visible'); playActive(); });
      film.load();
    });

    function playActive() {
      root.classList.toggle('has-video', films[scene].classList.contains('is-visible'));
      films.forEach((film, i) => {
        film.classList.toggle('is-current', i === scene);
        if (i !== scene || motionPaused || document.hidden) { film.pause(); return; }
        const attempt = film.play();
        if (attempt?.catch) attempt.catch(() => {});
      });
    }
    function renderLayer() {
      const item = layers[layer];
      find('#rs-layer-count').textContent = `${String(layer + 1).padStart(2, '0')} / 05`;
      find('#rs-layer-kicker').textContent = item.kicker;
      find('#rs-layer-value').textContent = item.value;
      find('#rs-layer-detail').textContent = item.detail;
      all('[data-layer]').forEach((button) => {
        const active = Number(button.dataset.layer) === layer;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      find('#rs-next-layer').innerHTML = layer === 4 ? 'BACK TO THE NUMBER <span>↑</span>' : 'TRACE NEXT LAYER <span>↓</span>';
    }
    function renderStep() {
      const item = steps[step];
      find('#rs-step-count').textContent = `${String(step + 1).padStart(2, '0')} / 04`;
      find('#rs-step-kicker').textContent = item.kicker;
      find('#rs-step-title').textContent = item.title;
      find('#rs-step-detail').textContent = item.detail;
      all('[data-step]').forEach((button) => {
        const active = Number(button.dataset.step) === step;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      find('#rs-next-step').innerHTML = step === 3 ? 'START AGAIN <span>↺</span>' : 'NEXT STEP <span>→</span>';
    }
    function closeIndex() {
      if (index.hidden) return;
      index.hidden = true;
      find('#rs-index-toggle').setAttribute('aria-expanded', 'false');
      find('#rs-index-toggle span').textContent = '＋';
    }
    function toggleIndex() {
      const opening = index.hidden;
      if (opening) closeDetails(false);
      index.hidden = !opening;
      find('#rs-index-toggle').setAttribute('aria-expanded', String(opening));
      find('#rs-index-toggle span').textContent = opening ? '×' : '＋';
      if (opening) index.querySelector('button').focus();
      else find('#rs-index-toggle').focus();
    }
    function closeDetails(restoreFocus = true) {
      if (openDetail < 0) return;
      details[openDetail].hidden = true;
      ['.rs-header', '.rs-stage', '.rs-footer'].forEach((selector) => { find(selector).inert = false; });
      const opener = openDetail === 0 ? find('#rs-open-proof') : find('#rs-open-close');
      opener.setAttribute('aria-expanded', 'false');
      openDetail = -1;
      if (restoreFocus) (lastOpener || opener).focus();
    }
    function showDetail(which, opener) {
      closeIndex();
      closeDetails(false);
      openDetail = which;
      lastOpener = opener;
      details[which].hidden = false;
      ['.rs-header', '.rs-stage', '.rs-footer'].forEach((selector) => { find(selector).inert = true; });
      opener.setAttribute('aria-expanded', 'true');
      details[which].querySelector('[data-close-detail]').focus();
    }
    function setScene(next) {
      const target = Math.max(0, Math.min(1, next));
      if (target === scene && root.dataset.scene) return;
      closeDetails(false);
      closeIndex();
      scene = target;
      root.dataset.scene = String(scene);
      scenes.forEach((section, i) => { section.hidden = i !== scene; section.classList.toggle('is-active', i === scene); });
      find('#rs-scene-label').textContent = scene === 0 ? "01 / HEROICS DON'T SCALE" : '02 / BRING YOUR LAST CLOSE';
      find('#rs-prev').disabled = scene === 0;
      find('#rs-next').disabled = scene === 1;
      playActive();
    }
    function setMotion(paused) {
      motionPaused = paused;
      const button = find('#rs-motion');
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
      button.querySelector('span').textContent = paused ? 'OFF' : 'ON';
      playActive();
    }

    find('#rs-index-toggle').addEventListener('click', toggleIndex);
    all('[data-goto]').forEach((button) => button.addEventListener('click', () => { setScene(Number(button.dataset.goto)); closeIndex(); root.focus({ preventScroll: true }); }));
    find('#rs-open-proof').addEventListener('click', (event) => showDetail(0, event.currentTarget));
    find('#rs-open-close').addEventListener('click', (event) => showDetail(1, event.currentTarget));
    all('[data-close-detail]').forEach((button) => button.addEventListener('click', () => closeDetails()));
    all('[data-layer]').forEach((button) => button.addEventListener('click', () => { layer = Number(button.dataset.layer); renderLayer(); }));
    all('[data-step]').forEach((button) => button.addEventListener('click', () => { step = Number(button.dataset.step); renderStep(); }));
    find('#rs-next-layer').addEventListener('click', () => { layer = (layer + 1) % layers.length; renderLayer(); });
    find('#rs-next-step').addEventListener('click', () => { step = (step + 1) % steps.length; renderStep(); });
    find('#rs-prev').addEventListener('click', () => setScene(scene - 1));
    find('#rs-next').addEventListener('click', () => setScene(scene + 1));
    find('#rs-motion').addEventListener('click', () => setMotion(!motionPaused));
    root.addEventListener('pointerdown', (event) => { if (!event.target.closest('button')) root.focus({ preventScroll: true }); });
    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
      root.addEventListener('pointermove', (event) => {
        if (openDetail >= 0 || !index.hidden) return;
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * -18;
        const y = ((event.clientY - rect.top) / rect.height - .5) * -12;
        root.style.setProperty('--rs-pan-x', `${x.toFixed(1)}px`);
        root.style.setProperty('--rs-pan-y', `${y.toFixed(1)}px`);
      }, { passive: true });
    }
    document.addEventListener('keydown', (event) => {
      const focused = document.activeElement;
      if (focused !== document.body && focused !== root && !root.contains(focused)) return;
      if (event.key === 'Escape') { if (openDetail >= 0) closeDetails(); else closeIndex(); return; }
      if (index.hidden === false) return;
      if (openDetail >= 0) {
        if (event.key === 'Tab') {
          const buttons = [...details[openDetail].querySelectorAll('button:not([disabled])')];
          if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
          else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
          return;
        }
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          if (openDetail === 0) { layer = (layer + 1) % layers.length; renderLayer(); }
          else { step = (step + 1) % steps.length; renderStep(); }
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (openDetail === 0) { layer = (layer - 1 + layers.length) % layers.length; renderLayer(); }
          else { step = (step - 1 + steps.length) % steps.length; renderStep(); }
        }
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); setScene(scene + 1); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); setScene(scene - 1); }
      if (event.key === '1' || event.key === '2') setScene(Number(event.key) - 1);
    });
    root.addEventListener('wheel', (event) => {
      if (openDetail >= 0 || !index.hidden || Math.abs(event.deltaY) < 12) return;
      if (Date.now() < wheelLockedUntil) return;
      const next = scene + (event.deltaY > 0 ? 1 : -1);
      if (next < 0 || next > 1) return;
      event.preventDefault();
      wheelLockedUntil = Date.now() + 650;
      setScene(next);
    }, { passive: false });
    root.addEventListener('touchstart', (event) => { touchStartX = event.touches[0]?.clientX ?? null; }, { passive: true });
    root.addEventListener('touchend', (event) => {
      if (openDetail >= 0 || !index.hidden || touchStartX === null || event.target.closest('button')) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      if (Math.abs(delta) > 70) setScene(scene + (delta < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
    document.addEventListener('visibilitychange', playActive);

    renderLayer(); renderStep(); setScene(0); setMotion(reducedMotion);
    return { setScene, setLayer: (n) => { layer = Math.max(0, Math.min(4, n)); renderLayer(); }, setStep: (n) => { step = Math.max(0, Math.min(3, n)); renderStep(); }, pause: () => setMotion(true), play: () => setMotion(false) };
  }
  window.RilletScenes = { mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(document.getElementById('rillet-scenes')));
  else mount(document.getElementById('rillet-scenes'));
})();
