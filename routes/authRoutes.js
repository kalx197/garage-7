const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, validateUser } = require('../middleware/validation');
const { body } = require('express-validator');

router.post('/register', validate([
    ...validateUser,
    body('role').optional().isIn(['admin', 'manager', 'staff'])
]), register);

router.post('/login', validate([
    body('username').notEmpty().trim().escape(),
    body('password').notEmpty()
]), login);

router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);

module.exports = router;
