// Binary attachments are local to this browser; metadata stays in the workspace model.
export const DOCUMENT_CATEGORIES = ['Drawings', 'Permits', 'RFIs', 'Submittals', 'Contracts', 'Meeting Minutes', 'Site Photos', 'Accounting / Receipts', 'Other Documents'];
export function documentMeta(row, project, index) {
  if (!row[3]) row[3] = {};
  const meta = row[3];
  meta.id ||= `${project.id}-document-${index}`;
  meta.workspaceId ||= project.workspaceId;
  meta.projectId = project.id;
  meta.category ||= /minutes/i.test(row[0]) ? 'Meeting Minutes' : /rfi/i.test(row[0]) ? 'RFIs' : row[1] === 'permit' ? 'Permits' : /drawing|package/i.test(row[0]) ? 'Drawings' : 'Other Documents';
  meta.version ||= '1';
  meta.status ||= 'Reference only';
  meta.fileType ||= String(row[2] || '').split(/[ ·]/)[0] || 'Unknown';
  // Never invent an upload date, uploader, or binary for legacy demo references.
  return meta;
}
export function safeImage(value) { return !value || /^https:\/\/\S+$/i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value); }
export function readLogo(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 500 * 1024) return reject(new Error('Choose a PNG, JPG, WebP or GIF under 500 KB.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
export function attachmentStore(mode, key, file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hosis-document-attachments', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onerror = () => reject(new Error('Local attachment storage is unavailable.'));
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('files', mode === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('files');
      const operation = mode === 'get' ? store.get(key) : store.put(file, key);
      transaction.oncomplete = () => { db.close(); resolve(operation.result); };
      transaction.onabort = transaction.onerror = () => { db.close(); reject(new Error('Attachment could not be stored. Check available browser storage.')); };
    };
  });
}
