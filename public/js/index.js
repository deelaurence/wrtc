import { Helper } from './utils.js';

const helper = new Helper();
const roomId = helper.getUrlParams('roomId');
const username = helper.name;
const sendMessageBtn = document.getElementById('send-message')
const enterMessage = document.getElementById('enter-message')
const openChatBtn = document.getElementById('open-chat-btn')
const closeChatBtn = document.getElementById('close-chat-bar')
const invitePopup = document.getElementById('invite-popup')
helper.printName();
openChatBtn.addEventListener('click', function(){
  helper.showChatbar()
})
closeChatBtn.addEventListener('click', function(){
  helper.hideChatbar()
})
// Prevent fullscreen
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
});

const socket = io(); 
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
let localStream;
let peerConnection;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const copyBtn = document.querySelector('#copy-button');
const inviteLink = document.querySelector('#invite-link');
const inviteButton = document.querySelector('#invite-button');
const closeButton = document.querySelector('#close-button');
inviteLink.textContent=window.location.href

closeButton.addEventListener('click',()=>{
  invitePopup.classList.add('hidden')
})
inviteButton.addEventListener('click',()=>{
  invitePopup.classList.remove('hidden')
})

endCallBtn.addEventListener('click',()=>{
  window.location.href='/'
})


const copyInviteLink=(e)=>{
  e.srcElement.src="https://cdn-icons-png.flaticon.com/128/5291/5291043.png"
  helper.copyText(inviteLink.textContent) 


  setTimeout(() => {
      e.srcElement.src="https://cdn-icons-png.flaticon.com/128/1621/1621635.png"
  }, 3000);
}
copyBtn.addEventListener('click', copyInviteLink)


socket.emit('join-room', { roomId, username });

socket.on('user-exist',()=>{
  window.location.href="/home.html"
  return alert("Username already exist in room")
})
socket.on('room-full',()=>{
  window.location.href="/home.html"
  return alert("Sorry, the room already has two users")
})

socket.on('user-joined-room', ({ newUser,username,allUsers,prevMessages }) => {
  helper.roomParticipants = allUsers;

  helper.printRoomParticipant(); 
  helper.printMeetingDetails();
  
  if(prevMessages&&prevMessages.length>0){
    helper.printPrevMessages(prevMessages)
  }
  else{
    const placeholder = [{message:"You can start a chat",username:"Admin"}]
    helper.printPrevMessages(placeholder) 
  }


});

sendMessageBtn.addEventListener("click", ()=>{
  socket.emit('send-message', { 
    message:enterMessage.value, 
    roomId,username:helper.name
  });
})
enterMessage.addEventListener('keydown', function(event) {
  if(event.key==='Enter'){
    event.preventDefault();
    socket.emit('send-message', { 
      message:enterMessage.value, 
      roomId,username:helper.name
    });
  }
});





socket.on('receive-message', (data)=>{
  helper.printMessages(data)
  enterMessage.value=''
})

// helper.printPrevMessages(data)

// Request camera and microphone access
async function startStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}

// Initialize peer connection and add local stream tracks
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { candidate: event.candidate, roomId });
    }
  };

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
}

// Start the call and create an offer
async function startCall() {
  createPeerConnection();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', { offer, roomId });

  startStream();
}

// Handle incoming offer, create an answer, and send it
async function handleOffer({ offer, roomId: offerRoomId }) {
  if (offerRoomId !== roomId) return;  // Ignore offers from other rooms

  createPeerConnection();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', { answer, roomId });
}

// Add event listeners for ICE candidates and answer
socket.on('offer', handleOffer);
socket.on('answer', async ({ answer, roomId: answerRoomId }) => {
  if (answerRoomId !== roomId) return;  // Ignore answers from other rooms

  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});
socket.on('ice-candidate', ({ candidate, roomId: candidateRoomId }) => {
  if (candidateRoomId !== roomId) return;  // Ignore candidates from other rooms

  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Event listeners for buttons
startCallBtn.addEventListener('click', startCall);

// Start stream on page load
startStream();
