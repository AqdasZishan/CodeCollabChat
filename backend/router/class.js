import express from "express"
import { ZodError } from "zod";
import { classSchema, projectSchema } from "../middleware.js/zodmiddleware.js";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid }  from "uuid"
import authmiddleware from "../middleware.js/authmiddleware.js";
const prisma=new PrismaClient();
const router =express.Router();
export default router

//create class
router.post("/class/create",authmiddleware,async(req,res)=>{
    const userId=req.USERID;
    const value=req.body;
    
    try{
        await classSchema.parseAsync(value);

        
        

        let user=await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
       
        //check  it is teacher only
        const type=user.type
        if(type==="STUDENT"){
            res.status(404).json({
                message:"student cannot create room"
            })
            return;
        }
        //check that another room with same id exists
        let room=await prisma.class.findFirst({
            where:{
                name:value.name
            }
        })
       
        if(room){
            return res.status(404).json({
                message:"room already exists Please choose another name"
            })
        }
      
        
        const id=uuid();
        room =await prisma.class.create({
            data:{
                id,
                name:value.name,
                teacherId:user.id
            }
        })

        return res.json({
            message:"room created"
        })

    }catch(err){
        if(err instanceof ZodError){
            res.status(404).json({
                message:err.issues[0].message
            })
            return;
        }
    }
})

//get all classes
router.get("/class/get/all",authmiddleware,async(req,res)=>{
    const userId=req.USERID;    
    try{
        const classes=await prisma.class.findMany({
            include:{
                teacher:{
                    select:{
                        name:true
                    }
                }
            }
        });        
        return res.json({
            message:"all classes are fetched",
            classes
        })

    }catch(err){       
        res.status(404).json({
            message:err
        })
        return 
    }
})

//get class of student joined
router.get("/class/get/teacher",authmiddleware,async(req,res)=>{
    const userId=req.USERID;
    
    try{
        const classes = await prisma.class.findMany({
            where: {
              teacher:{
                id:userId
              }
            },
            include:{
                teacher:{
                    select:{
                        name:true
                    }
                }
            }
          });
        console.log({classes});
        
        return res.json({
            classes
        })
    }catch(err){
        return res.json({
            message:err
        })
    }
})
router.get("/class/get/student",authmiddleware,async(req,res)=>{
    const userId=req.USERID;
    
    try{
        const classes = await prisma.class.findMany({
            where: {
              students:{
                id:userId
              },
            },
            include:{
                teacher:{
                    select:{
                        name:true
                    }
                }
            }
          });
        console.log({classes});
        
        return res.json({
            classes
        })
    }catch(err){
        return res.json({
            message:err
        })
    }
})

//create project
router.post("/project/create",authmiddleware,async (req,res)=>{
    const userId=req.USERID;
    const value =req.value;
    try{
        await projectSchema.parseAsync(value);

        const classname=await prisma.class.findFirst({
            where:{
                id:value.id
            }
        })
        if(!classname){
            return res.status(404).json({
                message:"class not found"
            })
        }
        const id=uuid();
        const project=await  prisma.project.create({
            data:{
                id,
                name:value.name,
                userId: userId,
                classId:value.classId
            }
        })

        return res.json({
            message:"project created"
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

//delete class
router.post("/class/delete/:id",authmiddleware,async (req,res)=>{
    const userId=req.USERID;
    const id=req.params.id;
    try{
        const user=await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
        if(user.type=="STUDENT"){
            return res.status(404).json({
                message:"student cannot delete the class"
            })
        }
        const classname=await prisma.class.delete({
            where:{
                id:id
            }
        })
        return res.json({
            message:`class deleted with name :${classname.name}`
        })
    }catch(err){
        res.status(404).json({
            message:err
        })
        return
    }

})


//delete project
router.post("/project/delete/:id",authmiddleware,async (req,res)=>{
    const id=req.params.id;
    const userId=req.USERID;

    try{
        const user=await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
        if(user.type=="STUDENT"){
            return res.status(404).json({
                message:"student cannot delete the class"
            })
        }
        const project=await prisma.project.delete({
            where:{
                id:id
            }
        })
        return res.json({
            message:`project deleted with name :${project.name}`
        })
    }catch(err){
        return res.status(404).json({
            message:err
        })
    }
})



