// =============================================================
//  AUTH.JS — with proper error messages so nothing hangs
// =============================================================

const Auth = {

    customer: {

        register: async function(email, password, name) {
            try {
                const existing = await DB.users.findByEmail(email);
                if (existing) return { success: false, message: 'Email already registered.' };
                const isStudent = email.toLowerCase().endsWith('@stu.kau.edu.sa');
                const newUser   = await DB.users.create({ email, password, name, isStudent, balance: 0 });
                return { success: true, user: { ...newUser, password: undefined } };
            } catch(e) {
                console.error('register error:', e);
                return { success: false, message: 'Connection error: ' + e.message };
            }
        },

        login: async function(email, password) {
            try {
                const user = await DB.users.findByEmail(email);
                if (!user || user.password !== password) {
                    return { success: false, message: 'Invalid email or password.' };
                }
                sessionStorage.setItem('currentUser', JSON.stringify({ ...user, password: undefined }));
                return { success: true, user: { ...user, password: undefined } };
            } catch(e) {
                console.error('login error:', e);
                return { success: false, message: 'Connection error: ' + e.message };
            }
        },

        logout: function() { sessionStorage.removeItem('currentUser'); },

        getCurrentUser: function() {
            const d = sessionStorage.getItem('currentUser');
            return d ? JSON.parse(d) : null;
        },

        refreshCurrentUser: async function() {
            try {
                const current = this.getCurrentUser();
                if (!current) return null;
                const fresh = await DB.users.findByEmail(current.email);
                if (!fresh) return null;
                const safe = { ...fresh, password: undefined };
                sessionStorage.setItem('currentUser', JSON.stringify(safe));
                return safe;
            } catch(e) {
                console.error('refresh error:', e);
                return this.getCurrentUser(); // fall back to cached session
            }
        }
    },

    worker: {

        login: async function(email, password) {
            try {
                const worker = await DB.workers.findByEmail(email);
                if (!worker || worker.password !== password) {
                    return { success: false, message: 'Invalid email or password.' };
                }
                sessionStorage.setItem('currentWorker', JSON.stringify({ ...worker, password: undefined }));
                return { success: true, worker: { ...worker, password: undefined } };
            } catch(e) {
                console.error('worker login error:', e);
                return { success: false, message: 'Connection error: ' + e.message };
            }
        },

        logout: function() { sessionStorage.removeItem('currentWorker'); },

        getCurrentWorker: function() {
            const d = sessionStorage.getItem('currentWorker');
            return d ? JSON.parse(d) : null;
        }
    }
};
