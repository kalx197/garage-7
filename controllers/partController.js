const Part = require('../models/Part');
const logger = require('../utils/logger');

const getParts = async (req, res) => {
    try {
        const filters = {
            category_id: req.query.category_id,
            supplier_id: req.query.supplier_id,
            search: req.query.search,
            low_stock: req.query.low_stock === 'true'
        };

        const parts = await Part.findAll(filters);
        res.json(parts);
    } catch (error) {
        logger.error('Error fetching parts', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const getPart = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ error: 'Part not found' });
        }
        res.json(part);
    } catch (error) {
        logger.error('Error fetching part', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const createPart = async (req, res) => {
    try {
        const existingPart = await Part.findByPartNumber(req.body.part_number);
        if (existingPart) {
            return res.status(400).json({ error: 'Part number already exists' });
        }

        const part = await Part.create(req.body);
        logger.info('Part created', { partId: part.id, partNumber: part.part_number, userId: req.user.id });
        res.status(201).json(part);
    } catch (error) {
        logger.error('Error creating part', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const updatePart = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ error: 'Part not found' });
        }

        const updatedPart = await Part.update(req.params.id, req.body);
        logger.info('Part updated', { partId: updatedPart.id, userId: req.user.id });
        res.json(updatedPart);
    } catch (error) {
        logger.error('Error updating part', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const deletePart = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ error: 'Part not found' });
        }

        // Soft delete - just mark as inactive
        await Part.update(req.params.id, { ...part, is_active: false });
        logger.info('Part deleted', { partId: req.params.id, userId: req.user.id });
        res.json({ message: 'Part deleted successfully' });
    } catch (error) {
        logger.error('Error deleting part', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const updateStock = async (req, res) => {
    try {
        const { quantity_change, transaction_type, reference_number, notes } = req.body;
        
        const result = await Part.updateQuantity(
            req.params.id,
            quantity_change,
            req.user.id,
            transaction_type,
            reference_number,
            notes
        );

        logger.info('Stock updated', { 
            partId: req.params.id, 
            change: quantity_change,
            userId: req.user.id 
        });

        res.json(result);
    } catch (error) {
        logger.error('Error updating stock', { error: error.message });
        if (error.message === 'Insufficient stock') {
            return res.status(400).json({ error: 'Insufficient stock for this operation' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

const getLowStock = async (req, res) => {
    try {
        const lowStockParts = await Part.getLowStock();
        res.json(lowStockParts);
    } catch (error) {
        logger.error('Error fetching low stock', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

const getInventorySummary = async (req, res) => {
    try {
        const summary = await Part.getSummary();
        res.json(summary);
    } catch (error) {
        logger.error('Error fetching inventory summary', { error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getParts,
    getPart,
    createPart,
    updatePart,
    deletePart,
    updateStock,
    getLowStock,
    getInventorySummary
};
