const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const UserRoutes = require('./routes/user');
const ItemRoutes = require('./routes/item');
const MessageRoutes = require('./routes/message');
const ConversationRoutes = require('./routes/conversation');

const Message = require('./models/message');
const Conversation = require('./models/conversation');

require('dotenv').config();
require('./config/connect');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', UserRoutes);
app.use('/item', ItemRoutes);
app.use('/message', MessageRoutes);
app.use('/conversation', ConversationRoutes);
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Joined conversation ${conversationId}`);
  });

  socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
    try {
      const message = await Message.create({
        conversationId,
        senderId,
        text,
      });

      const fullMessage = await Message.findById(message._id)
        .populate('senderId', 'name');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: fullMessage._id,
        updatedAt: Date.now(),
      });

      io.to(conversationId).emit('receiveMessage', fullMessage);

    } catch (err) {
      console.error('sendMessage error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Server running');
});
