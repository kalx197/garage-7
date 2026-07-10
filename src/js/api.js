const API_BASE_URL = 'http://localhost:5000/api';

class API {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const api = new API();

export const authAPI = {
    login: (username, password) => {
        return api.post('/auth/login', { username, password });
    },
    register: (userData) => {
        return api.post('/auth/register', userData);
    },
    getProfile: () => {
        return api.get('/auth/profile');
    },
    logout: () => {
        return api.post('/auth/logout');
    }
};

export const partsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/parts${params ? '?' + params : ''}`);
    },
    getById: (id) => {
        return api.get(`/parts/${id}`);
    },
    create: (data) => {
        return api.post('/parts', data);
    },
    update: (id, data) => {
        return api.put(`/parts/${id}`, data);
    },
    delete: (id) => {
        return api.delete(`/parts/${id}`);
    },
    updateStock: (id, data) => {
        return api.put(`/parts/${id}/stock`, data);
    },
    getLowStock: () => {
        return api.get('/parts/low-stock');
    },
    getSummary: () => {
        return api.get('/parts/summary');
    }
};

export const suppliersAPI = {
    getAll: () => {
        return api.get('/suppliers');
    },
    getById: (id) => {
        return api.get(`/suppliers/${id}`);
    },
    create: (data) => {
        return api.post('/suppliers', data);
    },
    update: (id, data) => {
        return api.put(`/suppliers/${id}`, data);
    },
    delete: (id) => {
        return api.delete(`/suppliers/${id}`);
    }
};

export const categoriesAPI = {
    getAll: () => {
        return api.get('/categories');
    },
    getById: (id) => {
        return api.get(`/categories/${id}`);
    },
    create: (data) => {
        return api.post('/categories', data);
    },
    update: (id, data) => {
        return api.put(`/categories/${id}`, data);
    },
    delete: (id) => {
        return api.delete(`/categories/${id}`);
    }
};

export const transactionsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/transactions${params ? '?' + params : ''}`);
    },
    getById: (id) => {
        return api.get(`/transactions/${id}`);
    },
    getPartTransactions: (partId) => {
        return api.get(`/transactions/part/${partId}`);
    }
};

export const workOrdersAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/workorders${params ? '?' + params : ''}`);
    },
    getById: (id) => {
        return api.get(`/workorders/${id}`);
    },
    create: (data) => {
        return api.post('/workorders', data);
    },
    update: (id, data) => {
        return api.put(`/workorders/${id}`, data);
    },
    delete: (id) => {
        return api.delete(`/workorders/${id}`);
    },
    addPart: (id, data) => {
        return api.post(`/workorders/${id}/parts`, data);
    },
    removePart: (id, partId) => {
        return api.delete(`/workorders/${id}/parts/${partId}`);
    },
    updateStatus: (id, status) => {
        return api.put(`/workorders/${id}/status`, { status });
    }
};
