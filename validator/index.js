const { check, validationResult} = require('express-validator');
exports.userSignupValidator = (req, res, next) => {
    check(req.body.name, 'Preencha o campo nome').notEmpty();
    check(req.body.email, 'Email deve ter entre 3 e 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email deve contar @')
        .isLength({
            min: 4,
            max: 32
        });
    check(req.body.password, 'Preencha o campo Senha').notEmpty();
    check(req.body.password)
        .isLength({ min: 6 })
        .withMessage('senha deve contar pelo menos 6 characters')
        .matches(/\d/)
        .withMessage('Senha deve conter um número');
    const errors = validationResult.error
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};
