import { connectDatabase } from "../database/database.js";
import { access_token, refresh_token } from "../utils/token.js";
import { User } from "../model/user.js";
import { order } from "../model/order.js";
import { order_item } from "../model/orderItem.js";
import { Product } from "../model/product.js";
import {coupons} from '../model/coupans.js'
import bcrypt from 'bcrypt';

export const admin_register_service=async(payload)=>{
    try {
        await connectDatabase();
        const password="Admin@123"

        const hashedPassword=await bcrypt.hash(password,10)

        await User.create({
            name:"Admin",
            email:"admin@gmail.com",
            password:hashedPassword,
            phone:9874563210,
            age:23,
            type:1
        });

        return {
            status:1,
            status_code:200,
            message:"admin seed successfully"
        }
    } catch (error) {
        throw {
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const admin_login_service=async(payload)=>{
    try {
        
        await connectDatabase();

        const userExist=await User.findOne({
            where:
            {
                email:payload.email,
                type:1
            }
        });

        if(!userExist){
            return {
                status:0,
                status_code:400,
                message:"admin not exist"
            }
        }

        const matchedPassword=await bcrypt.compare(payload.password,userExist.password)

        if(!matchedPassword){
            return {
                status:0,
                status_code:400,
                message:"password not matched"
            }
        }

        const data={
            id:userExist.id,
            name:userExist.name,
            email:userExist.email,
            type:userExist.type
        }

        const accessToken=await access_token(data)
        const refreshToken=await refresh_token(data)

        return {
            status:1,
            status_code:200,
            message:"admin login successfully",
            accessToken:accessToken,
            refreshToken:refreshToken,
            name:userExist.name,
            email:userExist.email,
            type:userExist.type
        }

    } catch (error) {
        throw{
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const  user_list_service=async()=>{
    try {
        await connectDatabase();

        const data = await User.findAll({
            order: [["id", "DESC"]],
        });

        return{
            status:1,
            status_code:200,
            message:"userlist",
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

export const delete_user_service=async(payload)=>{
    try {
        await connectDatabase();

        const userExist=await User.findOne({
            where:{id:payload.id}
        })

        if(!userExist){
            return {
                status:0,
                status_code:400,
                message:"user not exist"
            }
        }

        await User.destroy({where:{id:payload.id}})

        return {
            status:1,
            status_code:200,
            message:"user deleted successfullty"
        }

    } catch (error) {
        throw{
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const admin_list_product_service = async () => {
  try {
    await connectDatabase();

    const history = await order.findAll({
      where: {
        is_deleted: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: order_item,
          as: "items",
          where: {
            is_deleted: false,
          },
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    return {
      status: 1,
      status_code: 200,
      message: "All customers' purchase history fetched successfully",
      data: history,
    };
  } catch (error) {
    return {
        status:0,
        status_code:400,
        message:error.message
    }

  }
};

export const discount_product_service = async (payload) => {
  try {
    
    await connectDatabase();

    if (
      !Number.isFinite(Number(payload.discountPercentage)) ||
      Number(payload.discountPercentage) < 0 ||
      Number(payload.discountPercentage) > 100
    ) {
      return {
        status:0,
        status_code:400,
        message:"Discount must be between 0 to 100"
      }
    }

    const product = await Product.findByPk(payload.id);

    if (!product) {
      return {
        status:0,
        status_code:400,
        message:"product not found"
      }
    }

    await product.update({
      discountPercentage: Number(payload.discountPercentage),
    });

    return {
      status: 1,
      status_code:200,
      message: "Product discount updated successfully"
    };
  } catch (error) {
    throw{
        status:0,
        status_code:400,
        message:error.message
    }
  }
};

export const delete_discount_service = async (payload) => {
  try {
    await connectDatabase();

    const product = await Product.findByPk(payload.id);

    if (!product) {
      return {
        status:0,
        status_code:400,
        message:"product not found"
      }
    }

    await product.update({
      discountPercentage: 0,
    });

    return {
        status:1,
        status_code:200,
        message:"discount delete successfully"
    }

  } catch (error) {
    throw {
        status:0,
        status_code:400,
        message:error.message
    }
  }
};

export const create_coupon_service = async (payload) => {
  try {
    const {
      code,
      discountPercentage,
      minimumOrderAmount,
      expiryDate,
      usageLimit,
    } = payload;

    const existingCoupon = await coupons.findOne({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (existingCoupon) {
      return {
        status: 0,
        status_code:400,
        message: "Coupon code already exists",
      };
    }

    const newCoupon = await coupons.create({
      code: code.trim().toUpperCase(),
      discountPercentage,
      minimumOrderAmount,
      expiryDate,
      usageLimit,
      usedCount: 0,
      isActive: true,
    });

    return {
      status: 1,
      status_code:200,
      message: "Coupon created successfully",
      data: newCoupon,
    };
  } catch (error) {
    throw{
      status:0,
      status_code:400,
      message:error.message
    }
  }
};
