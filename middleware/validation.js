const { validationResult, body, param, query } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ 
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    };
};

const validateUser = [
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/),
    body('full_name').isLength({ min: 2, max: 100 }).trim().escape(),
    body('role').optional().isIn(['admin', 'manager', 'staff'])
];

const validatePart = [
    body('part_number').isLength({ min: 1, max: 50 }).trim().escape(),
    body('name').isLength({ min: 1, max: 100 }).trim().escape(),
    body('cost_price').isFloat({ min: 0 }),
    body('selling_price').isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
    body('min_quantity').optional().isInt({ min: 0 }),
    body('max_quantity').optional().isInt({ min: 0 })
];

module.exports = { validate, validateUser, validatePart };
