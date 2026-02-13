// =============================================================
//  MENU API — handles daily overrides + weekly template
//  Two separate bins:
//    MENU_BIN_ID  → daily overrides  { "2025-06-15": {...} }
//    WEEKLY_KEY   → stored inside MENU_BIN_ID as "__weekly__"
// =============================================================

const _cfg = {
    API_KEY:     '$2a$10$8aAU3ZjrF09kvBzqGZCwG.gkJ3qY9uugDrm.9LQ7H6rnTsvqVpU..',
    MENU_BIN_ID: '698f3d6dae596e708f282537',
    DATA_BIN_ID: '698f7917ae596e708f2894f6'
};

window.JSONBIN_CONFIG = _cfg;
export const JSONBIN_CONFIG = _cfg;

const BASE = 'https://api.jsonbin.io/v3/b';

// ── Fetch helpers ──
async function _read() {
    const res = await fetch(`${BASE}/${_cfg.MENU_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': _cfg.API_KEY }
    });
    if (!res.ok) throw new Error('Menu read failed ' + res.status);
    const json = await res.json();
    return json.record || {};
}

async function _write(data) {
    const res = await fetch(`${BASE}/${_cfg.MENU_BIN_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': _cfg.API_KEY },
        body: JSON.stringify(data)
    });
    return res.ok;
}

export const MenuAPI = {

    // ── Daily overrides ──

    async getAll() {
        try { return await _read(); } catch(e) { console.error(e); return {}; }
    },

    // Get menu for a date — returns override if exists, else null (caller uses weekly template)
    async getForDate(dateKey) {
        const all = await this.getAll();
        return all[dateKey] || null;
    },

    // Get menu for display — override first, then weekly template, then null
    async getForDateWithFallback(dateKey) {
        const all      = await this.getAll();
        if (all[dateKey]) return all[dateKey];
        const dayOfWeek = new Date(dateKey + 'T12:00:00').getDay();
        const weekly    = all['__weekly__'] || {};
        return weekly[dayOfWeek] || null;
    },

    async saveForDate(dateKey, menuData) {
        try {
            const all = await _read();
            all[dateKey] = menuData;
            return await _write(all);
        } catch(e) { console.error(e); return false; }
    },

    async clearOverride(dateKey) {
        try {
            const all = await _read();
            delete all[dateKey];
            return await _write(all);
        } catch(e) { console.error(e); return false; }
    },

    // ── Weekly template (stored as __weekly__ key inside menu bin) ──

    async getWeeklyTemplate() {
        try {
            const all = await _read();
            return all['__weekly__'] || {};
        } catch(e) { console.error(e); return {}; }
    },

    async saveWeeklyTemplate(template) {
        try {
            const all = await _read();
            all['__weekly__'] = template;
            return await _write(all);
        } catch(e) { console.error(e); return false; }
    }
};
