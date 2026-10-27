import { user_register_service, user_login_service, list_product_service, user_profile_service, update_password_service, user_history_service, list_coupon_Service } from "../service/userService.js"

export const user_register_controller=async(req,res)=>{
    try {
        const body={
            ...req.body
        }
        // console.log('body:',body);
        
        const response=await user_register_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const user_login_controller=async(req,res)=>{
    try {
        const body={
            ...req.body
        }
        const response=await user_login_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const list_product_controller = async (req, res) => {
  try {
    const response = await list_product_service();

    return res.status(response.status_code).json(response);
  } catch (error) {
    return res.status(error.status_code || 500).json({
      status: 0,
      status_code: error.status_code || 500,
      message: error.message
    });
  }
};

export const user_profile_controller=async(req,res)=>{
    try {
        const body={
            ...req.user
        }
        const response=await user_profile_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const update_password_controller=async(req,res)=>{
    try {
        const body={
            ...req.user,
            ...req.body
        }

        // console.log('body:',body);
        
        const response=await update_password_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const user_history_controller=async(req,res)=>{
    try {
        const body={
            ...req.user
        }

        const response=await user_history_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const list_Coupon_Controller=async(req,res)=>{
    try {
        const body={
            ...req.user
        }

        console.log('body:',body);
        

        const response=await list_coupon_Service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}