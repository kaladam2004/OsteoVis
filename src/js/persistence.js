const STORAGE_KEY = 'osteovis_prefs';

export function savePrefs(patch) {
  try {
    const existing = loadPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...patch }));
  } catch (e) {}
}

export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) { return {}; }
}

export function updateURL(params) {
  try {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    });
    history.replaceState(null, '', url);
  } catch (e) {}
}

export function getURLParams() {
  try {
    const url = new URL(window.location.href);
    return {
      bone:   url.searchParams.get('bone')   || null,
      mode:   url.searchParams.get('mode')   || null,
      system: url.searchParams.get('system') || null,
      view:   url.searchParams.get('view')   || null,
    };
  } catch (e) { return {}; }
}
