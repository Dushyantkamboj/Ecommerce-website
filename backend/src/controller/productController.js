import { list_product_service,product_details_service,add_product_service,update_product_service,delete_product_service,details_product_service, buying_product_service, list_product_details_service } from "../service/productService.js"

export const list_product_controller=async(req,res)=>{
    try {
        const response=await list_product_service();
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}
export const product_details_controller = async (req, res) => {
  try {
    const response = await product_details_service({
      id: req.params.id,
    });

    return res.status(response.status_code).json(response);
  } catch (error) {
    return res.status(500).json({
      status: 0,
      status_code: 500,
      message: error.message,
    });
  }
};

export const add_product_controller=async(req,res)=>{
    try {
        const body={
            ...req.user,
            ...req.body,
            image: req.file
                ? `/uploads/${req.file.filename}`
                : null,
        }

        // console.log('body:',body);
        
        const response=await add_product_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const update_product_controller = async (req, res) => {
    try {
        const body = {
            ...req.body,
            ...req.user,
            id: req.params.id,
            ...(req.file && {
                image: `/uploads/${req.file.filename}`,
            }),
        };

        const response = await update_product_service(body);

        return res.status(response.status_code).json(response);

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(400).json({
            status: 0,
            status_code: 400,
            message: "Failed to update product",
        });
    }
};

export const delete_product_controller = async (req, res) => {
    try {
        const body = {
            ...req.user,
            id: req.params.id,
        };

        const response = await delete_product_service(body);

        return res.status(response.status_code).json(response);

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            status: 0,
            status_code: 500,
            message: "Failed to delete product",
        });
    }
};

export const details_controller=async(req,res)=>{
    try {
        const body={
            ...req.user,
            ...req.query
        }
        const response=await details_product_service(body);
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const buying_product_controller=async(req,res)=>{
    try {
        const body={
            ...req.body,
            ...req.user
        }

        console.log('body:',body);

        const response=await buying_product_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}

export const list_product_details_controller=async(req,res)=>{
    try {
        const body={
            ...req.user
        }
        const response=await list_product_details_service(body)
        return res.status(response.status_code).json(response)
    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}
