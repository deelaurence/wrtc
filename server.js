'use strict';

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import { MessagesCache } from './utils/messagesCache.js';


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
const messageCacheInstance = new MessagesCache()

const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"], // The Socket.io admin UI
    credentials: true,
  }, 
});

instrument(io, {
  auth: false, // Set to true and add credentials for security if needed
});



// Serve static files for frontend
app.use(express.static('public',{
  index:"home.html"
}));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', ({ roomId, username }) => {
    
    function getUsersInRoom(roomId){
      const participants = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
        const participantSocket = io.sockets.sockets.get(socketId);
        return { id: participantSocket.id, username: participantSocket.username };
      });
      return participants;
    }

    const prevMessages=messageCacheInstance.getMessages(roomId)
    const roomParticipants = messageCacheInstance.getRoomUsers(roomId)
    
    const participants = getUsersInRoom(roomId)

    //room paricipants from cache [remains in cache until next server reload or intentionally clear]
    // console.log(roomParticipants)

    //room participants from socket.io [when browser client reloads, it refreshes]
    // console.log(participants)
    let usernamesExisting = participants?.map((participant)=>{
      return participant.username
    })
    let userExists = usernamesExisting.includes(username)

    console.log(`${participants.length} people in room ${roomId}`)
    if(userExists){
      socket.emit('user-exist')
    }
    //if participant are now two
    else if(participants.length===2){
      socket.emit('room-full')
    }
    else{
      socket.join(roomId);
      messageCacheInstance.setRoomUsers(roomId,username)
      socket.roomId = roomId;
      socket.username = username;
      io.to(roomId).emit('user-joined-room', { newUser: socket.id, username, allUsers: getUsersInRoom(roomId), prevMessages });
    }
  });

  socket.on('send-message',({message,username})=>{
    // console.log(data)
    messageCacheInstance.setMessages(
      socket.roomId,
      {message,username}
    )
    const prevMessages=messageCacheInstance.getMessages(socket.roomId)
    io.to(socket.roomId).emit('receive-message',prevMessages)
  })


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
