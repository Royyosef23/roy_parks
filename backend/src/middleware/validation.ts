/**
 * Validation middleware
 * 
 * הקובץ הזה מכיל כל הvalidation-ים לAPI
 * כל בקשה עוברת דרך בדיקות שמוודאות שהנתונים תקינים
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

/**
 * Wrapper function שמריץ Joi validation
 * 
 * @param schema - סכמת הvalidation של Joi
 * @param property - איזה חלק מהבקשה לבדוק (body/params/query)
 */
const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // מחזיר את כל השגיאות, לא רק הראשונה
      allowUnknown: false, // לא מאפשר fields נוספים שלא הוגדרו
      stripUnknown: true // מסיר fields לא מוכרים
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      throw createError(`Validation error: ${errorMessage}`, 400);
    }

    // מעדכן את הrequest עם הנתונים המנוקים
    req[property] = value;
    next();
  };
};

/**
 * Schema לvalidation של הרשמה
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Zא-ת\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Zא-ת\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required'
    }),
  
  phone: Joi.string()
    .pattern(/^(\+972|0)([0-9]{1})-?([0-9]{7,8})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid Israeli phone number'
    }),
  
  role: Joi.string()
    .valid('RESIDENT', 'ADMIN')
    .default('RESIDENT')
    .messages({
      'any.only': 'Role must be either RESIDENT or ADMIN'
    }),
  
  buildingCode: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      'string.min': 'Building code must be at least 2 characters long',
      'string.max': 'Building code must not exceed 20 characters',
      'string.pattern.base': 'Building code can only contain letters and numbers',
      'any.required': 'Building code is required'
    })
});

/**
 * Schema לvalidation של התחברות
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Schema לvalidation של בניין חדש
 */
const buildingSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Building name must be at least 2 characters long',
      'string.max': 'Building name must not exceed 100 characters',
      'any.required': 'Building name is required'
    }),
  
  address: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address must not exceed 200 characters',
      'any.required': 'Address is required'
    }),
  
  city: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City must not exceed 50 characters',
      'any.required': 'City is required'
    }),
  
  zipCode: Joi.string()
    .pattern(/^[0-9]{5,7}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid zip code (5-7 digits)',
      'any.required': 'Zip code is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 1000 characters'
    }),
  
  lat: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  
  lng: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  
  openTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .default('00:00')
    .messages({
      'string.pattern.base': 'Open time must be in format HH:MM'
    }),
  
  closeTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .default('23:59')
    .messages({
      'string.pattern.base': 'Close time must be in format HH:MM'
    })
});

/**
 * Schema לvalidation של חנייה חדשה
 */
const parkingSpotSchema = Joi.object({
  spotNumber: Joi.string()
    .min(1)
    .max(20)
    .required()
    .messages({
      'string.min': 'Spot number cannot be empty',
      'string.max': 'Spot number must not exceed 20 characters',
      'any.required': 'Spot number is required'
    }),
  
  floor: Joi.number()
    .integer()
    .min(-5)
    .max(50)
    .optional()
    .messages({
      'number.integer': 'Floor must be a whole number',
      'number.min': 'Floor cannot be lower than -5',
      'number.max': 'Floor cannot be higher than 50'
    }),
  
  size: Joi.string()
    .valid('COMPACT', 'REGULAR', 'LARGE')
    .default('REGULAR')
    .messages({
      'any.only': 'Size must be COMPACT, REGULAR, or LARGE'
    }),
  
  type: Joi.string()
    .valid('OUTDOOR', 'COVERED', 'GARAGE')
    .default('OUTDOOR')
    .messages({
      'any.only': 'Type must be OUTDOOR, COVERED, or GARAGE'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  hourlyRate: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Hourly rate must be a positive number',
      'any.required': 'Hourly rate is required'
    }),
  
  dailyRate: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Daily rate must be a positive number',
      'any.required': 'Daily rate is required'
    }),
  
  buildingId: Joi.string()
    .required()
    .messages({
      'any.required': 'Building ID is required'
    })
});

/**
 * Schema לvalidation של הגשת בקשת חנייה
 */
const submitParkingClaimSchema = Joi.object({
  floor: Joi.string()
    .valid('-1', '-2', '-3')
    .required()
    .messages({
      'any.only': 'Floor must be one of: -1, -2, -3',
      'any.required': 'Floor is required'
    }),
  
  spotNumber: Joi.string()
    .min(1)
    .max(3)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.min': 'Spot number must be at least 1 character',
      'string.max': 'Spot number must not exceed 3 characters',
      'string.pattern.base': 'Spot number must contain only numbers',
      'any.required': 'Spot number is required'
    }),
  
  additionalInfo: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Additional info must not exceed 500 characters'
    })
});

/**
 * Schema לvalidation של דחיית בקשה
 */
const rejectClaimSchema = Joi.object({
  reason: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.min': 'Rejection reason must be at least 5 characters',
      'string.max': 'Rejection reason must not exceed 500 characters',
      'any.required': 'Rejection reason is required'
    })
});

/**
 * Schema לvalidation של הוספת חנייה חדשה
 */
const addParkingSpotSchema = Joi.object({
  spotNumber: Joi.string()
    .min(1)
    .max(10)
    .required()
    .messages({
      'string.min': 'Spot number must be at least 1 character',
      'string.max': 'Spot number must not exceed 10 characters',
      'any.required': 'Spot number is required'
    }),
  
  floor: Joi.string()
    .optional()
    .messages({
      'string.base': 'Floor must be a string'
    }),
  
  size: Joi.string()
    .valid('COMPACT', 'REGULAR', 'LARGE')
    .default('REGULAR')
    .messages({
      'any.only': 'Size must be one of: COMPACT, REGULAR, LARGE'
    }),
  
  type: Joi.string()
    .valid('OUTDOOR', 'COVERED', 'GARAGE')
    .default('GARAGE')
    .messages({
      'any.only': 'Type must be one of: OUTDOOR, COVERED, GARAGE'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  hourlyRate: Joi.number()
    .positive()
    .max(1000)
    .required()
    .messages({
      'number.positive': 'Hourly rate must be a positive number',
      'number.max': 'Hourly rate must not exceed 1000',
      'any.required': 'Hourly rate is required'
    }),
  
  dailyRate: Joi.number()
    .positive()
    .max(10000)
    .required()
    .messages({
      'number.positive': 'Daily rate must be a positive number',
      'number.max': 'Daily rate must not exceed 10000',
      'any.required': 'Daily rate is required'
    }),
  
  buildingId: Joi.string()
    .required()
    .messages({
      'any.required': 'Building ID is required'
    })
});

/**
 * Schema לvalidation של עדכון חנייה
 */
const updateParkingSpotSchema = Joi.object({
  spotNumber: Joi.string()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'string.min': 'Spot number must be at least 1 character',
      'string.max': 'Spot number must not exceed 10 characters'
    }),
  
  floor: Joi.string()
    .optional()
    .messages({
      'string.base': 'Floor must be a string'
    }),
  
  size: Joi.string()
    .valid('COMPACT', 'REGULAR', 'LARGE')
    .optional()
    .messages({
      'any.only': 'Size must be one of: COMPACT, REGULAR, LARGE'
    }),
  
  type: Joi.string()
    .valid('OUTDOOR', 'COVERED', 'GARAGE')
    .optional()
    .messages({
      'any.only': 'Type must be one of: OUTDOOR, COVERED, GARAGE'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  hourlyRate: Joi.number()
    .positive()
    .max(1000)
    .optional()
    .messages({
      'number.positive': 'Hourly rate must be a positive number',
      'number.max': 'Hourly rate must not exceed 1000'
    }),
  
  dailyRate: Joi.number()
    .positive()
    .max(10000)
    .optional()
    .messages({
      'number.positive': 'Daily rate must be a positive number',
      'number.max': 'Daily rate must not exceed 10000'
    }),
  
  available: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Available must be a boolean value'
    })
});

/**
 * Export של כל הvalidation functions
 */
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateBuilding = validate(buildingSchema);
export const validateParkingSpot = validate(parkingSpotSchema);
export const validateSubmitParkingClaim = validate(submitParkingClaimSchema);
export const validateRejectClaim = validate(rejectClaimSchema);
export const validateAddParkingSpot = validate(addParkingSpotSchema);
export const validateUpdateParkingSpot = validate(updateParkingSpotSchema);

// Export של validation function הכללי למקרה שצריך
export { validate };

// Export של פונקציה כללית שמקבלת שם schema
export const validateRequest = (schemaName: string) => {
  switch (schemaName) {
    case 'register':
      return validateRegister;
    case 'login':
      return validateLogin;
    case 'building':
      return validateBuilding;
    case 'parkingSpot':
      return validateParkingSpot;
    case 'submitParkingClaim':
      return validateSubmitParkingClaim;
    case 'rejectClaim':
      return validateRejectClaim;
    case 'addParkingSpot':
      return validateAddParkingSpot;
    case 'updateParkingSpot':
      return validateUpdateParkingSpot;
    default:
      throw new Error(`Unknown validation schema: ${schemaName}`);
  }
};
