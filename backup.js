const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { instrument } = require("@socket.io/admin-ui");




const app = express();

// // CORS for Express
// app.use(cors({
//     origin: "*", 
//     methods: ["GET", "POST"]
// }));

const server = http.createServer(app);

// // CORS for Socket.io
// const io = new Server(server, {
  // cors: {
  //   origin: "*", 
  //   methods: ["GET", "POST"],
  //   allowedHeaders: ["custom-header"],
  //   credentials: true
  // }
// });


const io = require("socket.io")(server, {
  cors: {
    origin: ["https://admin.socket.io"], // The Socket.io admin UI
    credentials: true,
  }, 
});

instrument(io, {
  auth: false, // Set to true and add credentials for security if needed
});



// Serve static files for frontend
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');


  socket.on('join-room',({roomId,username})=>{
    console.log(`${username} ${socket.id} has joined room ${roomId}`);
    socket.roomId = roomId;

    socket.username=username;
    // socket.id=`${username}-${socket.id}`
    socket.join(roomId);
    //Emit to room but exclude user who just joined
    // socket.to(roomId).emit('user-joined-room', socket.id);
    //Emit to room but do not exclude user who just joined
    // io.to(roomId).emit('user-joined-room', socket.id);
    const participants = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
      const participantSocket = io.sockets.sockets.get(socketId);
      return { id: participantSocket.id, username: participantSocket.username };
    });
    
    io.to(roomId).emit('user-joined-room', {newUser:socket.id,allUsers:participants});
  })
  // io.to(socket.roomId).emit('user-joined-room', {});

  // Listen for 'offer' or 'answer' and forward it to the other peer
  // socket.on('offer', (data) => { 
  //   console.log('Offer received');
  //   return socket.broadcast.emit('offer', data)
  // });
  // socket.on('answer', (data) =>{
  //   console.log('Answer received'); 
  //   return socket.broadcast.emit('answer', data)
  // });
  // socket.on('ice-candidate', (data) => {
  //   console.log('ice-candidate received');
  //   return socket.broadcast.emit('ice-candidate', data)
  // });


  socket.on('offer', (data) => { 
    console.log('Offer received');
    io.to(socket.roomId).emit('offer', data)
  });
  socket.on('answer', (data) =>{
    console.log('Answer received'); 
    io.to(socket.roomId).emit('answer', data)
  });
  socket.on('ice-candidate', (data) => {
    console.log('ice-candidate received');
    io.to(socket.roomId).emit('ice-candidate', data)
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
