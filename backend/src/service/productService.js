import { connectDatabase } from "../database/database.js";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";
import { order } from "../model/order.js";
import { order_item } from "../model/orderItem.js";
import { Op } from "sequelize";

export const list_product_service = async () => {
  try {
    await connectDatabase();
    const data = await Product.findAll({
      order:[["id","DESC"]]
    });

    return {
      status: 1,
      status_code: 200,
      message: "productlist hn ye vali",
      data: data,
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message,
    };
  }
};

export const product_details_service = async (payload) => {
  try {
    await connectDatabase();

    const data = await Product.findOne({
      where: {
        id: payload.id,
      },
    });

    if (!data) {
      return {
        status: 0,
        status_code: 404,
        message: "Product not found",
      };
    }

    return {
      status: 1,
      status_code: 200,
      message: "Product details fetched successfully",
      data: data,
    };
  } catch (error) {
    throw error;
  }
};
export const add_product_service = async (payload) => {
  try {

    // console.log("payload:", payload);

    await connectDatabase();

    // const validUser = await Product.findOne({
    //   where: {
    //     type: {
    //       [Op.ne]: 2,
    //     },
    //   },
    // });

    // if(!validUser){
    //     return {
    //         status:0,
    //         status_code:400,
    //         message:"invalid user"
    //     }
    // }

    const product = await Product.create({
      name: payload.productname,
      description: payload.description,
      price: payload.price,
      stock: payload.stock,
      image: payload.image ?? null,
      isActive: payload.isActive ?? true,
      admin_id: payload.userId ?? null,
    });

    return {
      status: 1,
      status_code: 201,
      message: "Product added successfully",
      data: product,
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message,
    };
  }
};

export const update_product_service = async (payload) => {
  try {
    // console.log("payload:", payload);

    await connectDatabase();

    const product = await Product.findByPk(payload.id);

    if (!product) {
      return {
        status: 0,
        status_code: 404,
        message: "Product not found",
      };
    }

    const updateData = {
      name: payload.productname,
      description: payload.description,
      price: payload.price,
      stock: payload.stock,
      category: payload.category,
      isActive: payload.isActive,
    };

    // Update image only when a new image is uploaded
    if (payload.image !== undefined) {
      updateData.image = payload.image;
    }

    // Remove fields that were not provided
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await product.update(updateData);

    return {
      status: 1,
      status_code: 200,
      message: "Product updated successfully",
      data: product,
    };
  } catch (error) {
    return {
      status: 0,
      status_code: 400,
      message: error.message,
    };
  }
};

export const delete_product_service = async (payload) => {
  try {
    const product = await Product.findOne({ where: { id: payload.id } });

    if (!product) {
      return {
        status: 0,
        status_code: 404,
        message: "Product not found",
      };
    }

    await product.destroy();

    return {
      status: 1,
      status_code: 200,
      message: "Product deleted successfully",
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message,
    };
  }
};

export const details_product_service = async (body) => {
  const productIds = body.productIds;

  const products = await Product.findAll({
    where: {
      id: {
        [Op.in]: productIds,
      },
      isActive: true,
    },
    attributes: [
      "id",
      "name",
      "description",
      "price",
      "stock",
      "image",
    ],
  });

  const foundIds = products.map((product) => Number(product.id));

  const missingIds = productIds.filter(
    (id) => !foundIds.includes(Number(id))
  );

  if (missingIds.length > 0) {
    return {
      status: 0,
      status_code: 404,
      message: "Some selected products were not found or are inactive",
      missingIds,
    };
  }

  return {
    status: 1,
    status_code: 200,
    message: "Selected product details fetched successfully",
    data: products,
  };
};

export const buying_product_service=async(payload)=>{
  try {

    // console.log('payload:',payload);
    
    await connectDatabase();

    const userExist=await User.findOne({
      where:{id:payload.userId}
    });

    if(!userExist){
      return {
        status:0,
        status_code:400,
        message:"user not exist"
      }
    }

    const order_created=await order.create({
      user_id:payload.userId,
      total_amount:payload.total_amount,
      discount_amount:payload.discount_amount,
      status:true,
      is_deleted:false
    })

    // console.log('order_created:',order_created);
    
for (const item of payload.items) {
  const product = await Product.findByPk(item.product_id);

  if (!product) {
    return {
      status:0,
      status_code:400,
      message:"product not find"
    }
  }

  await order_item.create({
    order_id: order_created.id,
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: item.quantity,
    is_deleted: false,
  });
}

    return {
      status:1,
      status_code:200,
      message:"order created successfully"
    }

  } catch (error) {
    throw{
      status:0,
      status_code:400,
      message:error.message
    }
  }
}

export const list_product_details_service=async(payload)=>{
  try {
    await connectDatabase();

    const userExist=await User.findOne({where:{id:payload.userId}});

    if(!userExist){
      return {
        status:0,
        status_code:400,
        message:"user not exist"
      }
    }

const data = await order.findOne({
  order: [["id", "DESC"]],
});

// console.log("Latest order:", data);

    return {
      status:1,
      status_code:200,
      data:data
    }
    
  } catch (error) {
    throw{
      status:0,
      status_code:400,
      message:error.message
    }
  }
}