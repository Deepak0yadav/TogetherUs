const BASE = '/api';

async function request(path, options = {}) {
  const hasBody = options.body !== undefined && options.body !== null;

  // Pull token from Zustand persist storage
  let token = null;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.state?.token) token = parsed.state.token;
    }
  } catch (e) { }

  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export async function authMe() {
  return api.get('/auth/me');
}

export async function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export async function register(email, password, name) {
  return api.post('/auth/register', { email, password, name });
}

export async function getMyCouple() {
  return api.get('/couples/my');
}

export async function createCouple() {
  return api.post('/couples/create', {});
}

export async function joinCouple(inviteCode) {
  return api.post('/couples/join', { invite_code: inviteCode });
}

export async function getMyRoom() {
  return api.get('/rooms/my');
}

export async function getRoom(roomId) {
  return api.get(`/rooms/${roomId}`);
}

export async function updateRoomLayout(roomId, layout) {
  return api.patch(`/rooms/${roomId}/layout`, layout);
}

export async function createSession(roomId, data) {
  return api.post(`/rooms/${roomId}/sessions`, data);
}

export async function getSessions(roomId, limit = 20, offset = 0) {
  return api.get(`/rooms/${roomId}/sessions?limit=${limit}&offset=${offset}`);
}
