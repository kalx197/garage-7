const express = require('express');
const router = express.Router();
const {
    getParts,
    getPart,
    createPart,
    updatePart,
    deletePart,
    updateStock,
    getLowStock,
    getInventorySummary
} = require('../controllers/partController');
const { auth, authorize } = require('../middleware/auth');
const { validate, validatePart } = require('../middleware/validation');
const { body } = require('express-validator');

// Public routes (authenticated but any role)
router.get('/', auth, getParts);
router.get('/low-stock', auth, getLowStock);
router.get('/summary', auth, getInventorySummary);
router.get('/:id', auth, getPart);

// Admin/Manager only routes
router.post('/', auth, authorize('admin', 'manager'), validate(validatePart), createPart);
router.put('/:id', auth, authorize('admin', 'manager'), validate(validatePart), updatePart);
router.delete('/:id', auth, authorize('admin', 'manager'), deletePart);

// Stock update (staff+ can update stock)
router.put('/:id/stock', auth, validate([
    body('quantity_change').isInt({ min: -99999, max: 99999 }).notEmpty(),
    body('transaction_type').isIn(['purchase', 'sale', 'return', 'adjustment', 'transfer']),
    body('reference_number').optional().trim().escape(),
    body('notes').optional().trim().escape()
]), updateStock);

module.exports = router;
