import { body, validationResult } from 'express-validator';

const ROLES = {
    USER: 1,
    EMPLOYEE: 2,
    ADMIN: 3
};

// Validation rules for registration
const validateRegistration = [
    body('username')
        .isString()
        .trim()
        .escape()
        .notEmpty().withMessage('Username is required'),
    
    body('email')
        .isEmail()
        .notEmpty().withMessage('Email is required'),
    
    body('password')
        .isString()
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters'),
    
        body('role_id')
        .optional()
        .isInt()
        .custom((value, { req }) => {
            // If it is a public registration request (without authenticated user)
            if (!req.user) {
                // Force normal user role
                req.body.role_id = ROLES.USER;
                return true;
            }
            
            // If there is an authenticated user (admin)
            if (req.user && req.user.role_id === ROLES.ADMIN) {
                // Check that the role is valid
                if (![ROLES.USER, ROLES.EMPLOYEE, ROLES.ADMIN].includes(value)) {
                    throw new Error('Invalid role');
                }
                return true;
            }

            // If you are not an admin, you cannot assign roles.
            throw new Error('You do not have permission to assign roles.');
        }),
    
    validateResults
];

// Validation rules for login
const validateLogin = [
    body('username')
        .if(body('email').not().exists())
        .isString()
        .trim()
        .escape()
        .notEmpty().withMessage('Username is required'),
    
    body('email')
        .if(body('username').not().exists())
        .isEmail()
        .withMessage('Invalid email format'),
    
    body('password')
        .isString()
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters'),
    
    validateResults
];

// Middleware to handle validation results
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

export { validateRegistration, validateLogin };