// =============================================================
//  DATABASE.JS — Cloud storage via JSONBin
//  Fast, robust, with proper error handling
// =============================================================

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';

// Config — hardcoded so nothing can go wrong with file loading
const CFG = {
    API_KEY:     '$2a$10$8aAU3ZjrF09kvBzqGZCwG.gkJ3qY9uugDrm.9LQ7H6rnTsvqVpU..',
    MENU_BIN_ID: '698f3d6dae596e708f282537',
    DATA_BIN_ID: '698f7917ae596e708f2894f6'
};

// Also set on window so ES module pages can use it
window.JSONBIN_CONFIG = CFG;

// ── Cache to reduce API calls ──
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 10000; // 10 seconds

// ── Fetch with timeout ──
async function _fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (e) {
        clearTimeout(timer);
        if (e.name === 'AbortError') throw new Error('Request timed out after ' + timeoutMs + 'ms');
        throw e;
    }
}

// ── Read from JSONBin ──
async function _read() {
    // Return cached data if fresh
    if (_cache && (Date.now() - _cacheTime) < CACHE_TTL) {
        return _cache;
    }
    const res = await _fetchWithTimeout(`${JSONBIN_BASE}/${CFG.DATA_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': CFG.API_KEY }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`JSONBin read failed (${res.status}): ${text}`);
    }
    const json = await res.json();
    _cache = json.record;
    _cacheTime = Date.now();
    return _cache;
}

// ── Write to JSONBin ──
async function _write(data) {
    const res = await _fetchWithTimeout(`${JSONBIN_BASE}/${CFG.DATA_BIN_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': CFG.API_KEY
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`JSONBin write failed (${res.status}): ${text}`);
    }
    _cache = data;         // update cache
    _cacheTime = Date.now();
    return true;
}

// ── Default workers ──
const DEFAULT_WORKERS = [
    { id: 'worker1', email: 'worker@kau.edu.sa', password: 'worker123', name: 'Cafeteria Worker' }
];

// ── DB ──
const DB = {

    users: {
        getAll: async function() {
            const data = await _read();
            return data.users || [];
        },
        findByEmail: async function(email) {
            const users = await this.getAll();
            return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        },
        create: async function(user) {
            const data = await _read();
            const newUser = { id: 'user_' + Date.now(), ...user, createdAt: new Date().toISOString() };
            data.users = data.users || [];
            data.users.push(newUser);
            await _write(data);
            return newUser;
        },
        update: async function(id, updates) {
            const data = await _read();
            const i = (data.users || []).findIndex(u => u.id === id);
            if (i === -1) return null;
            data.users[i] = { ...data.users[i], ...updates };
            await _write(data);
            return data.users[i];
        }
    },

    workers: {
        findByEmail: async function(email) {
            const data = await _read();
            const workers = (data.workers && data.workers.length) ? data.workers : DEFAULT_WORKERS;
            return workers.find(w => w.email.toLowerCase() === email.toLowerCase()) || null;
        }
    },

    tickets: {
        getAll: async function() {
            const data = await _read();
            return data.tickets || [];
        },
        getUserTickets: async function(userId) {
            const tickets = await this.getAll();
            return tickets.filter(t => t.userId === userId);
        },
        create: async function(ticket) {
            const data = await _read();
            const newTicket = {
                id: 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                ...ticket,
                used: false,
                createdAt: new Date().toISOString()
            };
            data.tickets = data.tickets || [];
            data.tickets.push(newTicket);
            await _write(data);
            return newTicket;
        },
        findById: async function(id) {
            const tickets = await this.getAll();
            return tickets.find(t => t.id === id) || null;
        },
        markAsUsed: async function(id) {
            const data = await _read();
            const i = (data.tickets || []).findIndex(t => t.id === id);
            if (i === -1) return null;
            data.tickets[i].used   = true;
            data.tickets[i].usedAt = new Date().toISOString();
            await _write(data);
            return data.tickets[i];
        }
    }
};
