

    //PREVENT FULLSCREEN
    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    });


    const socket = io(); // Replace with your computer’s IP
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const startCallBtn = document.getElementById('startCallBtn');
    // const receiveCallBtn = document.getElementById('receiveCallBtn');
    let localStream;
    let peerConnection;
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  
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
          socket.emit('ice-candidate', event.candidate);
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
      socket.emit('offer', offer);



      startStream()
    }

    // Handle incoming offer, create an answer, and send it
    async function handleOffer(offer) {
      createPeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', answer);
    }

    // Add event listeners for ICE candidates and answer
    socket.on('offer', handleOffer);
    socket.on('answer', async (answer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on('ice-candidate', (candidate) => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Event listeners for buttons
    startCallBtn.addEventListener('click', startCall);
    // receiveCallBtn.addEventListener('click', );

    // Start stream on page load
    startStream();