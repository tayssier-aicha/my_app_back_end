const express=require('express');
const cors=require('cors');
const http = require('http');
const UserRoutes=require('./routes/user');
const ItemRoutes=require('./routes/item');
const MessageRoutes=require('./routes/message');
const ConversationRoutes=require('./routes/conversation');

const app=express();

require('dotenv').config();

require('./config/connect');
app.use(cors());

app.use(express.json());


app.use('/user',UserRoutes);
app.use('/item',ItemRoutes);
app.use('/message',MessageRoutes);
app.use('/conversation',ConversationRoutes);
app.use('/uploads',express.static('uploads'));


const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room ${conversationId}`);
  });

  socket.on('sendMessage', (data) => {
    const { conversationId } = data;
    socket.to(conversationId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


server.listen(4000,()=>{
    console.log('Server is running');
});
