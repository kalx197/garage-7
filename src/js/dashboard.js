import { partsAPI } from './api.js';
import { formatCurrency, formatDate } from './utils.js';

export class DashboardManager {
    constructor() {
        this.container = document.getElementById('dashboardStats');
    }

    async load() {
        try {
            await this.loadSummary();
            await this.loadLowStock();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadSummary() {
        try {
            const summary = await partsAPI.getSummary();
            
            document.getElementById('totalParts').textContent = summary.total_parts || 0;
            document.getElementById('totalItems').textContent = summary.total_items || 0;
            document.getElementById('inventoryValue').textContent = formatCurrency(summary.total_inventory_value || 0);
            
            // Load low stock count
            const lowStock = await partsAPI.getLowStock();
            document.getElementById('lowStockCount').textContent = lowStock.length || 0;
        } catch (error) {
            console.error('Failed to load summary:', error);
        }
    }

    async loadLowStock() {
        try {
            const lowStock = await partsAPI.getLowStock();
            const listContainer = document.getElementById('lowStockList');
            
            if (lowStock.length === 0) {
                listContainer.innerHTML = '<p class="no-data">No low stock items found</p>';
                return;
            }

            const table = document.createElement('table');
            table.className = 'table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Part Number</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Min Quantity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${lowStock.map(part => `
                        <tr>
                            <td>${part.part_number}</td>
                            <td>${part.name}</td>
                            <td>${part.category_name || 'N/A'}</td>
                            <td class="text-danger">${part.quantity}</td>
                            <td>${part.min_quantity}</td>
                            <td>
                                <button onclick="window.app.loadPage('parts')" class="btn btn-sm btn-primary">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            listContainer.innerHTML = '';
            listContainer.appendChild(table);
        } catch (error) {
            console.error('Failed to load low stock:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        // Display error in the container
        const container = document.getElementById('dashboardStats');
        if (container) {
            // Could also display error in a toast or notification
        }
    }
}
