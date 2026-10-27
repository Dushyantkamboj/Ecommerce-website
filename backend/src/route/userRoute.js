import express from 'express';
import { validation } from '../middleware/validationMiddleware.js';
import { user_register_schema,user_login_schema, update_password_schema } from '../validation/validation.js';
import { user_register_controller, user_login_controller,list_product_controller, user_profile_controller, update_password_controller, user_history_controller, list_Coupon_Controller } from '../controller/userController.js';
import { authentication } from '../middleware/authentication.js';

const router=express.Router();

router.post('/register',validation(user_register_schema,"body"),user_register_controller);
router.post('/login',validation(user_login_schema,"body"),user_login_controller);

router.get('/list',list_product_controller);
router.get('/profile',authentication,user_profile_controller);
router.patch('/update',validation(update_password_schema,"body"),authentication, update_password_controller);

router.get('/history',authentication,user_history_controller)
router.get('/listcoupon',authentication,list_Coupon_Controller)

export {router as userRoute}