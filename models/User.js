const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findAll() {
        const result = await query(
            'SELECT id, username, email, role, full_name, phone, is_active, created_at, last_login FROM users ORDER BY id'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT id, username, email, role, full_name, phone, is_active, created_at, last_login FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }

    static async create(userData) {
        const { username, email, password, role, full_name, phone } = userData;
        const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
        
        const result = await query(
            `INSERT INTO users (username, email, password_hash, role, full_name, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, email, role, full_name, phone, is_active`,
            [username, email, password_hash, role, full_name, phone]
        );
        return result.rows[0];
    }

    static async update(id, userData) {
        const { full_name, phone, role, is_active } = userData;
        const result = await query(
            `UPDATE users 
             SET full_name = $1, phone = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, username, email, role, full_name, phone, is_active`,
            [full_name, phone, role, is_active, id]
        );
        return result.rows[0];
    }

    static async updateLastLogin(id) {
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    }

    static async validatePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

module.exports = User;
