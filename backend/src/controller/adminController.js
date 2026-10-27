import { admin_register_service, admin_login_service,user_list_service, delete_user_service, admin_list_product_service, discount_product_service, delete_discount_service, create_coupon_service } from "../service/adminService.js"

export const admin_register_controller=async(req,res)=>{
    try {
        const body={
            ...req.body
        }

        if(req.body.admin_secret_key===process.env.ADMIN_SECRET_KEY){
            const response=await admin_register_service(body)
            return res.status(response.status_code).json(response)
        }else{
            return res.status(400).json({
                status:0,
                status_code:400,
                message:"unauthorized user"
            })
        }
        
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const admin_login_controller=async(req,res)=>{
    try {
        const body={
            ...req.body
        }
        
        // console.log('body:',body);
        
        const response=await admin_login_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const user_list_controller=async(req,res)=>{
    try {
        const response=await user_list_service()
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}


export const delete_user_controller=async(req,res)=>{
    try {
        const body={
            ...req.body
        }
        const response=await delete_user_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}
export const admin_history_controller=async(req,res)=>{
    try {
        const body={
            ...req.user
        }
        const response=await admin_list_product_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const discount_product_controller=async(req,res)=>{
    try {
        const body={
            ...req.body,
            ...req.params
        }

        const response=await discount_product_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const delete_discount_controller=async(req,res)=>{
    try {
        const body={
            ...req.params
        }

        const response=await delete_discount_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const create_coupon_controller=async(req,res)=>{
    try {
        const body={
            ...req.user,
            ...req.body
        }

        const response=await create_coupon_service(body)
        return res.status(response.status_code).json(response)

    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}