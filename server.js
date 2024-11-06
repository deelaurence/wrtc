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

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    const participants = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
      const participantSocket = io.sockets.sockets.get(socketId);
      return { id: participantSocket.id, username: participantSocket.username };
    });
    
    io.to(roomId).emit('user-joined-room', { newUser: socket.id, allUsers: participants });
  });

  socket.on('offer', (data) => {
    const roomId = socket.roomId;
    console.log('Offer received');
    socket.to(roomId).emit('offer', data);  // Send to others in the room
  });

  socket.on('answer', (data) => {
    const roomId = socket.roomId;
    console.log('Answer received');
    socket.to(roomId).emit('answer', data);  // Send to others in the room
  });

  socket.on('ice-candidate', (data) => {
    const roomId = socket.roomId;
    console.log('ICE Candidate received');
    socket.to(roomId).emit('ice-candidate', data);  // Send to others in the room
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
