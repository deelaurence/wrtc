const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// // CORS for Express
// app.use(cors({
//     origin: "*", // Replace with your frontend origin
//     methods: ["GET", "POST"]
// }));

const server = http.createServer(app);

// // CORS for Socket.io
const io = new Server(server, {
  // cors: {
  //   origin: "*", // Replace this with your frontend URL
  //   methods: ["GET", "POST"],
  //   allowedHeaders: ["custom-header"],
  //   credentials: true
  // }
});

// Serve static files for frontend
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'offer' or 'answer' and forward it to the other peer
  socket.on('offer', (data) => { 
    console.log('Offer received');
    return socket.broadcast.emit('offer', data)
  });
  socket.on('answer', (data) =>{
    console.log('Answer received'); 
    return socket.broadcast.emit('answer', data)
  });
  socket.on('ice-candidate', (data) => {
    console.log('ice-candidate received');
    return socket.broadcast.emit('ice-candidate', data)
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
