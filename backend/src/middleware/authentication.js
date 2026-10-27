import jwt from 'jsonwebtoken';

export const authentication=async(req,res,next)=>{
    try {
       const authResponse = req.headers.authorization;

        if(!authResponse){
            return res.status(400).json({
                status:0,
                status_code:400,
                message:"unauthorized access"
            })
        };

        const token=authResponse.split(" ")[1]
        
        const decode=await jwt.verify(token,process.env.JWT_SECRET);

        req.user=decode;

        next();

    } catch (error) {
        return res.status(400).json({
            status:0,
            status_code:400,
            message:error.message
        })
    }
}