const DATABASE = 'news-reader-v1';
const VERSION = 1;
let connection;

function requestDone(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function openStorage() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB ist nicht verfügbar.'));
      return;
    }
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('favorites')) db.createObjectStore('favorites', { keyPath: 'url' });
      if (!db.objectStoreNames.contains('articles')) db.createObjectStore('articles', { keyPath: 'url' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Die Datenbank ist durch einen anderen Tab blockiert.'));
  });
  return connection;
}

async function get(store, key) {
  const db = await openStorage();
  return requestDone(db.transaction(store, 'readonly').objectStore(store).get(key));
}

async function getAll(store) {
  const db = await openStorage();
  return requestDone(db.transaction(store, 'readonly').objectStore(store).getAll());
}

async function put(store, value) {
  const db = await openStorage();
  const transaction = db.transaction(store, 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore(store).put(value);
  await done;
}

async function remove(store, key) {
  const db = await openStorage();
  const transaction = db.transaction(store, 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore(store).delete(key);
  await done;
}

export async function initializeFavorites(catalog, initialIds) {
  const initialized = await get('settings', 'initialized');
  if (!initialized) {
    const db = await openStorage();
    const transaction = db.transaction(['favorites', 'settings'], 'readwrite');
    const done = transactionDone(transaction);
    for (const id of initialIds) {
      const feed = catalog.find(item => item.id === id);
      if (feed) transaction.objectStore('favorites').put({ ...feed, addedAt: Date.now() });
    }
    transaction.objectStore('settings').put({ key: 'initialized', value: true });
    await done;
  }
  return getAll('favorites');
}

export const listFavorites = () => getAll('favorites');
export const addFavorite = feed => put('favorites', { ...feed, addedAt: Date.now() });
export const updateFavorite = feed => put('favorites', feed);
export const deleteFavorite = url => remove('favorites', url);
export const readCachedFeed = url => get('articles', url);
export const cacheFeed = (url, articles) => put('articles', { url, articles, fetchedAt: Date.now() });
