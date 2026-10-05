(() => {
  'use strict';
  const widgets = [...document.querySelectorAll('[data-project-media]')];
  if (!widgets.length || !window.URL?.createObjectURL || !window.Image) return;

  // Preserve existing browser-local previews without offering image editing controls.
  // Published assets remain configured in projects.json.
  const database = new Promise(resolve => {
    if (!window.indexedDB) return resolve(null);
    let settled = false;
    const finish = db => {
      if (settled) { db?.close(); return; }
      settled = true;
      window.clearTimeout(timer);
      resolve(db);
    };
    const timer = window.setTimeout(() => finish(null), 8000);
    try {
      const request = window.indexedDB.open('nadeeshan-project-image-previews', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('images')) request.result.createObjectStore('images', { keyPath: 'slug' });
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        finish(request.result);
      };
      request.onerror = request.onblocked = () => finish(null);
    } catch { finish(null); }
  });

  async function stored(slug) {
    const db = await database;
    if (!db) throw new Error('Preview storage unavailable');
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readonly');
      const request = transaction.objectStore('images').get(slug);
      let value;
      request.onsuccess = () => { value = request.result; };
      transaction.oncomplete = () => resolve(value);
      transaction.onerror = transaction.onabort = () => reject(new Error('Preview storage failed'));
    });
  }

  function decode(file) {
    if (!(file instanceof Blob)) return Promise.reject(new Error('Invalid image'));
    const url = window.URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      const probe = new window.Image();
      const timer = window.setTimeout(() => finish(false), 15000);
      const finish = ok => {
        window.clearTimeout(timer);
        probe.onload = probe.onerror = null;
        probe.removeAttribute('src');
        if (ok) resolve(url);
        else { window.URL.revokeObjectURL(url); reject(new Error('Image cannot be decoded')); }
      };
      probe.onload = () => finish(probe.naturalWidth > 0 && probe.naturalHeight > 0);
      probe.onerror = () => finish(false);
      probe.src = url;
    });
  }

  const cleanups = [];
  let disposed = false;
  for (const widget of widgets) {
    const image = widget.querySelector('.work-image');
    const placeholder = widget.querySelector('.work-image-empty');
    if (!image || !placeholder) continue;
    const slug = widget.dataset.projectMedia;
    const title = widget.dataset.projectTitle;
    const publishedSrc = widget.dataset.publishedSrc || '';
    let previewUrl = null;
    const release = () => {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    };
    cleanups.push(release);
    const showPreview = url => {
      release();
      previewUrl = url;
      image.src = url;
      image.alt = `${title} project image`;
      image.loading = 'eager';
      image.hidden = false;
      placeholder.hidden = true;
    };

    image.addEventListener('error', () => {
      if (image.hidden) return;
      image.hidden = true;
      image.removeAttribute('src');
      placeholder.hidden = false;
      release();
    });

    (async () => {
      let url;
      try {
        const record = await stored(slug);
        if (disposed || !record || record.publishedSrc !== publishedSrc || !(record.file instanceof Blob)) return;
        url = await decode(record.file);
        if (disposed) { window.URL.revokeObjectURL(url); return; }
        showPreview(url);
      } catch { /* The published image/empty area remains usable without local storage. */ }
    })();
  }

  window.addEventListener('pagehide', event => {
    // Keep live object URLs when the browser preserves this page in its back/forward cache.
    if (!event.persisted) {
      disposed = true;
      cleanups.forEach(cleanup => cleanup());
    }
  });
})();
