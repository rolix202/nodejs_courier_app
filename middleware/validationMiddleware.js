import { body, validationResult } from "express-validator";


const withValidationErrors = (validateValues) => {
    return [validateValues, (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({msg: 'Validation failed'})
        }
        else{
            next ();
        }
    }]
}

export const validateInput = withValidationErrors([
    body('comment').trim()
])