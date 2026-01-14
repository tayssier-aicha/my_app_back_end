const mongoose=require('mongoose');

const Item=mongoose.model('Item',{
    id:{
        type:Number,
    },
    type:{
        type:String,
    },
    description:{
        type:String,
    },
    location:{
        type:String,
    },
    date:{
        type:Date,
    }

});

module.exports=Item;