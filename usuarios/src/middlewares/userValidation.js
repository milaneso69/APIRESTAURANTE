import { body, validationResult } from 'express-validator';

export const validateCreateUser= [
    body('name')
    .isString()
    .notNumeric()
    .withMessage('No numbers allowed')
    .notEmpty()
    .withMessage('Name is required'),

    body('first_name')
    .isString()
    .notNumeric()
    .withMessage('No numbers allowed')
    .notEmpty()
    .withMessage('First name is required'),

    body('phone_number')
    .notString()
    .withMessage('No text allowed')
    .notEmpty()
    .withMessage('Phone number is required'),

    validateResults

]

//Middleware to handle validation results
function validateResults(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            errors: errors.array()
        });
    }
    next();
}

export { validateCreateUser };