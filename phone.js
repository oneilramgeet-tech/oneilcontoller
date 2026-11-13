/* Phone-only extras for DJ O'Neil. Loaded after the mixer's own code. */
(() => {
  'use strict';

  // 1. Work offline: save the app on the phone
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('Offline mode not set up:', e));

  // 2. Ask the phone not to clear cue points, crates and saved songs when storage runs low
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (_) {}

  // 3. Keep the screen on while the app is open (the music would stop if the phone went to sleep)
  let lock = null;
  const keepAwake = async () => {
    if (lock || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    try { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } catch (_) {}
  };
  addEventListener('pointerdown', keepAwake, { capture: true });
  document.addEventListener('visibilitychange', keepAwake);

  // 4. Sideways (landscape) only: lock it when the phone allows, otherwise show a "turn your phone" message
  const lockLandscape = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (_) {} };
  lockLandscape();
  addEventListener('pointerdown', lockLandscape, { capture: true, once: true });
  const hint = document.createElement('div');
  hint.id = 'rotateHint';
  hint.innerHTML = '<b>📱</b><div>Turn your phone sideways<br>to use DJ O\'Neil</div>';
  document.documentElement.appendChild(hint);
})();
