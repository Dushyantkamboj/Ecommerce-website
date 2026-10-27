import express from 'express';
import { validation } from '../middleware/validationMiddleware.js';
import { admin_register_schema, admin_login_schema,delete_user_schema, create_coupon_Schema } from '../validation/adminValidations.js';
import { admin_login_controller, admin_register_controller, user_list_controller, delete_user_controller, admin_history_controller, discount_product_controller,delete_discount_controller, create_coupon_controller } from '../controller/adminController.js';
import { authentication } from '../middleware/authentication.js';

const router=express.Router();

router.post('/register',validation(admin_register_schema,"body"),admin_register_controller);
router.post('/login',validation(admin_login_schema,"body"),admin_login_controller)

router.get('/list',authentication,user_list_controller)
router.delete('/delete',validation(delete_user_schema,"body"),authentication,delete_user_controller)
router.get('/history',authentication,admin_history_controller)

router.patch('/discount/:id',authentication,discount_product_controller)
router.delete('/discount/:id',authentication,delete_discount_controller)

router.post('/coupon',validation(create_coupon_Schema,"body"),authentication,create_coupon_controller)

export {router as adminRoute}