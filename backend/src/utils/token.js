import jwt from 'jsonwebtoken';

export const access_token=(payload)=>{
    try {
        const token=jwt.sign(
            {
                userId:payload.id,
                name:payload.name,
                email:payload.email,
                type:payload.type
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'15m'
            }
        )
        return token;
    } catch (error) {
        return {
            status:0,
            status_code:400,
            message:error.message
        }
        
    }
}

export const refresh_token=(payload)=>{
    try {
        const token=jwt.sign(
            {
                userId:payload.id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'7d'
            }
        )
        return token;
    } catch (error) {
        return {
            status:0,
            status_code:400,
            message:error.message
        }
        
    }
}