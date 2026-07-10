import { authAPI, partsAPI, suppliersAPI, categoriesAPI, transactionsAPI, workOrdersAPI } from './api.js';
import { DashboardManager } from './dashboard.js';
import { PartsManager } from './parts.js';
import { SuppliersManager } from './suppliers.js';
import { CategoriesManager } from './categories.js';
import { TransactionsManager } from './transactions.js';
import { WorkOrdersManager } from './workorders.js';

class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        this.managers = {
            dashboard: new DashboardManager(),
            parts: new PartsManager(),
            suppliers: new SuppliersManager(),
            categories: new CategoriesManager(),
            transactions: new TransactionsManager(),
            workorders: new WorkOrdersManager()
        };

        this.init();
    }

    init() {
        if (this.token && this.user) {
            this.showMainContent();
            this.loadPage('dashboard');
        } else {
            this.showLoginPage();
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.loadPage(page);
            });
        });

        // Refresh dashboard
        document.getElementById('refreshDashboard')?.addEventListener('click', () => {
            this.loadPage('dashboard');
        });
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await authAPI.login(username, password);
            this.token = response.token;
            this.user = response.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            this.showMainContent();
            this.loadPage('dashboard');
            this.updateUserInfo();
        } catch (error) {
            errorDiv.textContent = error.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.showLoginPage();
    }

    showLoginPage() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
    }

    showMainContent() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    }

    updateUserInfo() {
        document.getElementById('userInfo').textContent = `${this.user.full_name} (${this.user.role})`;
    }

    loadPage(page) {
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected page
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.style.display = 'block';
        }

        // Load data for the page
        if (this.managers[page]) {
            this.managers[page].load();
        }
    }
}

// Initialize the application
const app = new App();

export default app;
