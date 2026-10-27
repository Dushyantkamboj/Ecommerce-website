import { connectDatabase } from "../database/database.js"
import { User } from "../model/user.js"
import { access_token,refresh_token } from "../utils/token.js"
import bcrypt from 'bcrypt'
import { Product } from "../model/product.js"
import { order } from "../model/order.js"
import { order_item } from "../model/orderItem.js"
import {coupons} from '../model/coupans.js'
import { Op } from "sequelize";

export const user_register_service=async(payload)=>{
    try {
        // console.log('payload:',payload);
        
        await connectDatabase();

        const userExist=await User.findOne({
            where:{email:payload.email}
        });

        if(userExist){
            return {
                status:0,
                status_code:400,
                message:"user already exist"
            }
        }

        const hashedPassword= await bcrypt.hash(payload.password,10)

        await User.create({
            name:payload.name,
            email:payload.email,
            password:hashedPassword,
            phone:payload.phone,
            age:payload.age,
            type:2
        })

        return {
            status:1,
            status_code:200,
            message:"user register successfully"
        }

    } catch (error) {
        return {
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const user_login_service=async(payload)=>{
    try {
        await connectDatabase();

        const userExist=await User.findOne({
            where:{email:payload.email}
        });

        if(!userExist){
            return {
                status:0,
                status_code:400,
                message:"user not exist"
            }
        }

        const matchedPassword=await bcrypt.compare(payload.password,userExist.password);
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
            email:userExist.email
        }

        const accessToken=await access_token(data)
        const refreshToken=await refresh_token(data)

        return {
            status:1,
            status_code:200,
            message:"user login successfully",
            accessToken:accessToken,
            refreshToken:refreshToken,
            name:userExist.name,
            email:userExist.email,
            type:userExist.type
        }

    } catch (error) {
        throw {
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const list_product_service=async(payload)=>{
    try {
        await connectDatabase();

        const product=await Product.findAll({
            order:[["id","Desc"]]
        });

        // console.log('product:',product);
        

        return {
            status:1,
            status_code:200,
            message:"product list",
            data:product
        }

    } catch (error) {
        throw {
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const user_profile_service=async(payload)=>{
    try {
        await connectDatabase();

        const data=await User.findOne({where:{id:payload.userId}});

        return {
            status:1,
            status_code:200,
            message:"userDetails",
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

export const update_password_service=async(payload)=>{
    try {
        await connectDatabase();

        const userExist=await User.findOne({where:{id:payload.userId}})

        if(!userExist){
            return {
                status:0,
                status_code:400,
                message:"user not exist"
            }
        }

        const passwordMatched=await bcrypt.compare(payload.currentPassword,userExist.password)

        if(!passwordMatched){
            return {
                status:0,
                status_code:400,
                message:"currentPassword not matched"
            }
        }

        const hashedPassword=await bcrypt.hash(payload.newPassword,10)

        await User.update(
            {
                password:hashedPassword
            },
            {
                where:{
                    id:payload.userId,
                }
            }
        )

        return {
            status:1,
            status_code:200,
            message:"password update successfully"
        }

    } catch (error) {
        throw{
            status:0,
            status_code:400,
            message:error.message
        }
    }
}

export const user_history_service = async (payload) => {
  try {
    await connectDatabase();

    // Check whether the user exists
    const userExist = await User.findOne({
      where: {
        id: payload.userId,
        is_deleted: false,
      },
    });

    if (!userExist) {
      return {
        status: 0,
        status_code: 404,
        message: "User does not exist",
      };
    }

    // Join orders with order_items to fetch purchase history
    const history = await order.findAll({
      where: {
        user_id: payload.userId,
        is_deleted: false,
      },
      include: [
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
      message: "Purchase history fetched successfully",
      data: history,
    };
  } catch (error) {
    console.error("User history service error:", error);

    return {
      status: 0,
      status_code: 500,
      message: error.message || "Unable to fetch purchase history",
    };
  }
};

export const list_coupon_Service = async (payload) => {
  try {
    const currentDate = new Date();

    const couponList = await coupons.findAll({
      where: {
        isActive: true,
        expiryDate: {
          [Op.gt]: currentDate,
        },
        usedCount: {
          [Op.lt]: coupons.sequelize.col("usageLimit"),
        },
      },
      attributes: [
        "id",
        "code",
        "discountPercentage",
        "minimumOrderAmount",
        "expiryDate",
      ],
      order: [["id", "DESC"]],
    });

    return {
      status: 1,
      status_code: 200,
      message: "Coupons fetched successfully",
      data: couponList,
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 500,
      message: error.message,
    };
  }
};
