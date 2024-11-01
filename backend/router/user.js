import express from "express";
import { userSchema, userSignin } from "../middleware.js/zodmiddleware.js"; // Ensure the correct path and extension
import {PrismaClient, UserType} from "@prisma/client"
import { v4 as uuid }  from "uuid"
import { ZodError } from "zod";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import authmiddlware from "../middleware.js/authmiddleware.js"
dotenv.config();
const prisma=new PrismaClient();

const userRouter = express.Router();
export default userRouter;

//create user
userRouter.post("/create", async (req, res) => {
    let value = req.body;
    
    try {
         await userSchema.parseAsync(value); 
        console.log(value);
        if(value.type==="STUDENT" && !value.roll || value.roll.length<=3){
            return res.status(404).json({
                message:"roll cannot be empty please type roll grater than 3digit"
            })
        }
        console.log("adsfadsffd");
       let user = await prisma.user.findFirst({
        where: {
            email: value.email,
        },
    });
        if(user){
            res.status(404).json({
                message:"user already exists"
            })
            return;
        }
        const id =uuid();
        user=await prisma.user.create({
            data:{
                id:id,
                email:value.email,
                name:value.name,
                roll:value.roll ? value.roll : "",
                type:value.type ==="STUDENT" ? UserType.STUDENT:UserType.TEACHER,
                password:value.password
            }
        })
        const token=jwt.sign({id},process.env.JWT_SECRET);

        return res.status(201).json({
            message: "User created",
            data: value,
            token:token 
            });
    } catch (err) {
        if(err instanceof ZodError){
            return res.status(400).json({
                message: err.issues[0].message // Return the validation errors
            });
        }else{
            return res.status(404).json({
                message:err
            })
        }
        
    }
});


//signin user
userRouter.post("/signin",async(req,res)=>{
    let value=req.body;
    try{
    value=await userSignin.parseAsync(value);
    const user=await prisma.user.findFirst({
        where:{
            email:value.email
        }
    })    
    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }
    if(user.password!=value.password){
        return res.status(404).json({
            message:"wrong password"
        })
    }
    const id=user.id;
    const token =jwt.sign(id,process.env.JWT_SECRET);
    return res.json({
        message:"user logged in successfully",
        token,
        user
    })
    }catch(err){
        if(err instanceof ZodError){
            return res.status(404).json({
                message:err.issues[0].message
            })

        }else{
            return res.status(404).json({
                message:err
            })
        }
    }
})

userRouter.get("/details",authmiddlware,async(req,res)=>{
    const userId=req.USERID;
    
    try{
        const user =await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }
        return res.json({
            message:"fetched user details",
            name:user.name,
            email:user.email,
            type:user.type,
            roll:user.roll,
            id:user.id
        })

    }catch(err){
        res.status(404).json({
            message:err
        })
        return 
    }
})



