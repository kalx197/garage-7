const { query } = require('../config/database');

class Part {
    static async findAll(filters = {}) {
        let sql = `
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM parts p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.is_active = true
        `;
        const params = [];
        let paramCount = 1;

        if (filters.category_id) {
            sql += ` AND p.category_id = $${paramCount}`;
            params.push(filters.category_id);
            paramCount++;
        }

        if (filters.supplier_id) {
            sql += ` AND p.supplier_id = $${paramCount}`;
            params.push(filters.supplier_id);
            paramCount++;
        }

        if (filters.search) {
            sql += ` AND (p.name ILIKE $${paramCount} OR p.part_number ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
            paramCount++;
        }

        if (filters.low_stock) {
            sql += ` AND p.quantity <= p.min_quantity`;
        }

        sql += ` ORDER BY p.name`;

        const result = await query(sql, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT p.*, c.name as category_name, s.name as supplier_name
             FROM parts p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN suppliers s ON p.supplier_id = s.id
             WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByPartNumber(partNumber) {
        const result = await query(
            'SELECT * FROM parts WHERE part_number = $1',
            [partNumber]
        );
        return result.rows[0];
    }

    static async create(partData) {
        const {
            part_number, name, description, category_id, supplier_id,
            quantity, min_quantity, max_quantity, cost_price, selling_price,
            location, bin_number
        } = partData;

        const result = await query(
            `INSERT INTO parts (
                part_number, name, description, category_id, supplier_id,
                quantity, min_quantity, max_quantity, cost_price, selling_price,
                location, bin_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [part_number, name, description, category_id, supplier_id,
             quantity || 0, min_quantity || 10, max_quantity || 100,
             cost_price, selling_price, location, bin_number]
        );
        return result.rows[0];
    }

    static async update(id, partData) {
        const {
            name, description, category_id, supplier_id,
            min_quantity, max_quantity, cost_price, selling_price,
            location, bin_number, is_active
        } = partData;

        const result = await query(
            `UPDATE parts 
             SET name = $1, description = $2, category_id = $3, supplier_id = $4,
                 min_quantity = $5, max_quantity = $6, cost_price = $7, selling_price = $8,
                 location = $9, bin_number = $10, is_active = $11, updated_at = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING *`,
            [name, description, category_id, supplier_id,
             min_quantity, max_quantity, cost_price, selling_price,
             location, bin_number, is_active, id]
        );
        return result.rows[0];
    }

    static async updateQuantity(id, quantityChange, userId, transactionType, referenceNumber = null, notes = null) {
        const client = await require('../config/database').pool.connect();
        
        try {
            await client.query('BEGIN');

            // Get current quantity
            const currentPart = await client.query(
                'SELECT quantity FROM parts WHERE id = $1 FOR UPDATE',
                [id]
            );
            
            if (!currentPart.rows[0]) {
                throw new Error('Part not found');
            }

            const previousQuantity = currentPart.rows[0].quantity;
            const newQuantity = previousQuantity + quantityChange;

            if (newQuantity < 0) {
                throw new Error('Insufficient stock');
            }

            // Update part quantity
            await client.query(
                'UPDATE parts SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [newQuantity, id]
            );

            // Create transaction record
            await client.query(
                `INSERT INTO inventory_transactions (
                    part_id, user_id, transaction_type, quantity_change,
                    previous_quantity, new_quantity, reference_number, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [id, userId, transactionType, quantityChange,
                 previousQuantity, newQuantity, referenceNumber, notes]
            );

            await client.query('COMMIT');

            return {
                part_id: id,
                previous_quantity: previousQuantity,
                new_quantity: newQuantity,
                change: quantityChange
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getLowStock() {
        const result = await query('SELECT * FROM low_stock_parts ORDER BY quantity ASC');
        return result.rows;
    }

    static async getSummary() {
        const result = await query('SELECT * FROM inventory_summary');
        return result.rows[0];
    }
}

module.exports = Part;
