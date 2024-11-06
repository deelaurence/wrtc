import { Helper } from './utils.js';

const helper = new Helper();
const roomId = helper.getUrlParams('roomId');
const username = helper.name;

helper.printName();

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
let localStream;
let peerConnection;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

socket.emit('join-room', { roomId, username });

socket.on('user-joined-room', ({ newUser, allUsers }) => {
  helper.roomParticipants = allUsers;
  helper.printRoomParticipant();
});

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
