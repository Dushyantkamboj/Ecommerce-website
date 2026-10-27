import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export const sequelize=new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host:process.env.DB_HOST,
        port:Number(process.env.DB_PORT),
        dialect:"mysql",
        logging:false
    }
)

let database;

export const connectDatabase=async()=>{
    try {
        if(database){
            return database
        }

        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync()
        console.log('table created successfully');

        return database=sequelize
        
    } catch (error) {
        return {
            status:0,
            status_code:400,
            message:error.message
        }
    }
}