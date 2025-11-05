// server/index.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
app.use(cors()); 
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);

  try {
    const messages = await Message.find().sort({ timestamp: 1 }).exec();
    socket.emit('load_messages', messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
  
  socket.on('chat_message', async (data) => {
    const newMessage = new Message({
      author: data.author,
      content: data.content,
    });
    
    try {
      const savedMessage = await newMessage.save();
      io.emit('chat_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));