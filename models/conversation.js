const mongoose=require('mongoose');

const convShema=new mongoose.Schema({
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    Message:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }],
    lastMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    },
    { timestamps: true}
);
module.exports=mongoose.model('Conversation',convShema);