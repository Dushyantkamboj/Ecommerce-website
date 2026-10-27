import joi from 'joi';
 
export const user_register_schema=joi.object({
    name:joi.string().required(),
    email:joi.string().email().required(),
    password:joi.string().min(6).required(),
    // role:joi.number().valid(1,2).strict().required(),
    phone:joi.string().required(),
    age:joi.number().required()
})

export const user_login_schema=joi.object({
    email:joi.string().email().required(),
    password:joi.string().required()
});

export const update_password_schema=joi.object({
    currentPassword:joi.string().required(),
    newPassword:joi.string().required(),
    confirmPassword:joi.string().required()
})