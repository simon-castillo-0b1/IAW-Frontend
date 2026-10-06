const BASE_URL = 'http://localhost:3000/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || `Error HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

// GET /api/sites
export async function getSites() {
  const res = await fetch(`${BASE_URL}/sites`);
  return handleResponse(res);
}

//GET /api/sites/:id
export async function getSite(id) {
  const res = await fetch(`${BASE_URL}/sites/${id}`);
  return handleResponse(res);
}

//POST /api/sites
export async function createSite(siteData) {
  const res = await fetch(`${BASE_URL}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(siteData),
  });
  return handleResponse(res);
}

//PATCH /api/sites/:id
export async function updateSite(id, siteData) {
  const res = await fetch(`${BASE_URL}/sites/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(siteData),
  });
  return handleResponse(res);
}

//DELETE /api/sites/:id
export async function deleteSite(id) {
  const res = await fetch(`${BASE_URL}/sites/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

//GET /api/sites/:id/snapshots
export async function getSiteSnapshots(siteId) {
  const res = await fetch(`${BASE_URL}/sites/${siteId}/snapshots`);
  return handleResponse(res);
}

//GET /api/snapshots?siteId=...
export async function getSnapshots(siteId = '') {
  const url = siteId
    ? `${BASE_URL}/snapshots?siteId=${siteId}`
    : `${BASE_URL}/snapshots`;
  const res = await fetch(url);
  return handleResponse(res);
}

//GET /api/snapshots/:id
export async function getSnapshot(id) {
  const res = await fetch(`${BASE_URL}/snapshots/${id}`);
  return handleResponse(res);
}

//POST /api/snapshots
export async function createSnapshot(snapshotData) {
  const res = await fetch(`${BASE_URL}/snapshots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshotData),
  });
  return handleResponse(res);
}

//PATCH /api/snapshots/:id
export async function updateSnapshot(id, snapshotData) {
  const res = await fetch(`${BASE_URL}/snapshots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshotData),
  });
  return handleResponse(res);
}

//DELETE /api/snapshots/:id
export async function deleteSnapshot(id) {
  const res = await fetch(`${BASE_URL}/snapshots/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
