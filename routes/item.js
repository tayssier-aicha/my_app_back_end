const express=require('express');
const router=express.Router();
 const multer=require('multer');
const Item = require('../models/item');

 let filename='';
 const storage=multer.diskStorage({
    destination : './uploads',
    filename:(req,file,cb)=>{
        try{
        const ext=file.mimetype.split('/')[1];
        const name=Date.now()+'.'+ext;
        filename=name;
        cb(null,name);
        }
        catch(err){
        console.log("err= "+err);
    }
    }
});

const upload=multer({storage});

router.post('/add',upload.any('image'),async (req,res)=>{
    try{

        const data=req.body;
        const item=new Item(data);
        item.image=filename;
        const saveItem=await item.save();
        filename='';
        res.status(200).send(saveItem);
    }
    catch(err){
        console.log("------------>"+err);
        res.status(400).send(err);
    }
    
});
router.get('/getall', async (req, res) => {
    try {
        const items=await Item.find();
        res.status(200).send(items);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.get('/get', async (req, res) => {
    try {
        console.log(req);
        
        const type=req.body?.type;
        if(!type){
            const items=await Item.find();
            res.status(200).send(items);
        }
        else{
            const items=await Item.find({type});
            res.status(200).send(items);
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.get('/get/:id',async (req,res)=>{
    try{
        id=req.params.id;
        items=await Item.findOne({_id:id});
        if(!items){
            res.status(404).send("item not found");
        }
        else{
            res.status(200).send(items);
        }
       
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.put('/updateId/:id',upload.any('image'),async(req,res)=>{
    try{
        const id=req.params.id;
        const newData=req.body;
        const item=await Item.findById({_id:id});
        if(!item){
            res.status(404).send("item not found ");
        }
        else{
            if(newData.image){
                newData.image=filename;
            }   
            const updatedItem=await Item.findByIdAndUpdate({_id:id},newData);
            filename='';
            res.status(200).send(updatedItem);
        }
    }
    catch(error){
        res.status(400).send(error);
    }
});

router.delete('/delete/:id',async(req,res)=>{
    try{
        id=req.params.id;
        item=await Item.findOne({_id:id});
        if(!item){
            res.status(404).send("item not found");
        }
        else{
            items=await Item.findByIdAndDelete({_id:id});
            res.status(200).send(items);
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

module.exports=router;
