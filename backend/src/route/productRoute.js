import express from 'express';
import { validation } from '../middleware/validationMiddleware.js';
import { authentication } from '../middleware/authentication.js';
import { add_product_schema,update_product_schema,delete_product_schema,product_details_schema, buying_product_schema } from '../validation/productValidations.js';
import { list_product_controller,product_details_controller,add_product_controller,update_product_controller,delete_product_controller, details_controller, buying_product_controller, list_product_details_controller } from '../controller/productController.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router=express.Router();

router.get('/list',authentication,list_product_controller)
router.get("/details/:id",product_details_controller);
router.post("/add",uploadProductImage.single("image"),authentication,validation(add_product_schema,"body"),add_product_controller);
router.patch("/update/:id",uploadProductImage.single("image"),authentication,validation(update_product_schema, "body"),update_product_controller);
router.delete("/delete/:id",authentication,delete_product_controller);

router.get('/details',validation(product_details_schema,"query"),details_controller);

router.post('/buying',validation(buying_product_schema,"body"),authentication,buying_product_controller)

router.get('/listproductdetails',authentication,list_product_details_controller);

export {router as productRoute}