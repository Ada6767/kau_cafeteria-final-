// Menu API — hardcoded fallback so it always works
const _cfg = (typeof window !== 'undefined' && window.JSONBIN_CONFIG) ? window.JSONBIN_CONFIG : {
    API_KEY:     "$2a$10$8aAU3ZjrF09kvBzqGZCwG.gkJ3qY9uugDrm.9LQ7H6rnTsvqVpU..",
    MENU_BIN_ID: "698f3d6dae596e708f282537",
    DATA_BIN_ID: "698f7917ae596e708f2894f6"
};

// Also export for ES module imports
export const JSONBIN_CONFIG = _cfg;

const BASE = 'https://api.jsonbin.io/v3/b';

export const MenuAPI = {
    async getAll() {
        try {
            const res = await fetch(`${BASE}/${_cfg.MENU_BIN_ID}/latest`, {
                headers: { 'X-Master-Key': _cfg.API_KEY }
            });
            if (!res.ok) throw new Error('fetch failed ' + res.status);
            const json = await res.json();
            return json.record || {};
        } catch(e) {
            console.error('MenuAPI.getAll:', e);
            return {};
        }
    },

    async getForDate(dateKey) {
        const all = await this.getAll();
        return all[dateKey] || null;
    },

    async saveForDate(dateKey, menuData) {
        try {
            const all = await this.getAll();
            all[dateKey] = menuData;
            const res = await fetch(`${BASE}/${_cfg.MENU_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': _cfg.API_KEY
                },
                body: JSON.stringify(all)
            });
            return res.ok;
        } catch(e) {
            console.error('MenuAPI.saveForDate:', e);
            return false;
        }
    }
};
