const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, role } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const user = await User.create({
            username,
            email,
            password,
            full_name,
            phone,
            role: role || 'staff'
        });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        logger.info('User registered', { userId: user.id, username: user.username });

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        logger.error('Registration error', { error: error.message });
        res.status(500).json({ error: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is disabled' });
        }

        const isValidPassword = await User.validatePassword(password, user.password_hash);
        if (!isValidPassword) {
            logger.warn('Failed login attempt', { username });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await User.updateLastLogin(user.id);

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        logger.info('User logged in', { userId: user.id, username: user.username });

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            phone: user.phone
        };

        res.json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (error) {
        logger.error('Login error', { error: error.message });
        res.status(500).json({ error: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        logger.error('Profile fetch error', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        // JWT is stateless, client should discard the token
        logger.info('User logged out', { userId: req.user.id });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { register, login, getProfile, logout };
