export class Helper{
    nameInLocalStorage = localStorage.getItem("name")
    
    
    name=this.nameInLocalStorage||prompt('Enter name')

    nameToDisplay;
    roomParticipants=[];
    usernamesAlreadyInDom = [];

    localStream;
    videoTrack=true;

    toggleVideo(button) {
        
        const localStream=this.localStream
        if (localStream) {
        console.log(this.videoTrack)
        let videoTrack = localStream.getVideoTracks()[0];
        
        if (this.videoTrack) {
            videoTrack.stop()
            videoTrack = null;
            this.videoTrack=false
            button.src ="https://cdn-icons-png.flaticon.com/128/16747/16747998.png" 
        } else {
            location.reload()

        }
        
      }}
      
      // Toggle audio track
      toggleAudio(button) {
        const localStream=this.localStream
        if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            button.src = !audioTrack.enabled ? "https://cdn-icons-png.flaticon.com/128/9035/9035397.png" 
            : "https://cdn-icons-png.flaticon.com/128/880/880564.png";
            // document.getElementById("toggleAudioButton").innerText = audioTrack.enabled ? "Mute Audio" : "Unmute Audio";
          }
        }
      }


    
    // Set name in local storage
    setNameInLocalStorage(){
        localStorage.setItem("name", this.name)
    }

    copyText(text) {
        // Get the invite link text
      
        // Copy text to clipboard
        navigator.clipboard.writeText(text)
          .then(() => {
            // console.log("Copied text to clipboard");
          })
          .catch(err => {
            console.error("Failed to copy: ", err);
          });
      }
      

    printName(){
        document.querySelector('.name').textContent=this.name
    }
    
    
    printRoomParticipant(){
    
        // Get unique usernames from roomParticipants
        let usernames = this.roomParticipants.map(user => user.username);
        usernames = [...new Set(usernames)];
    
    
        const container = document.querySelector('.participants');
        const usernamesAlreadyInDom = this.usernamesAlreadyInDom;
        if(usernames&&usernames.length){
            document.querySelector('#participants-count').textContent=usernames.length
        }
        usernames.forEach((participant,index) => {
            // Check if the username has already been appended
            if (!usernamesAlreadyInDom.includes(participant)) {
               if (participant===this.name){
                this.nameToDisplay = `${participant} (me)`
               }
               else{
                this.nameToDisplay = participant;
               }
                const paragraph = document.createElement('p');
                paragraph.innerHTML = `<div class="flex items-center gap-2">  
                <div class="w-6 h-6 flex items-center font-semibold justify-center bg-gray-300 rounded-full">${this.nameToDisplay.substring(0,1).toUpperCase()}</div>
                <div class="flex gap-12 items-center justify-between text-sm bg-gray-100 px-4 py-2 rounded-lg">
                    <p class="font-semibold capitalize">${this.nameToDisplay}</p>
                    <div class='flex gap-2' > 
                        <img id="userVideoBtn${index}" class="h-4 " src="https://cdn-icons-png.flaticon.com/128/5107/5107435.png"/>
                        <img id="userAudioBtn${index}" class="h-4 " src="https://cdn-icons-png.flaticon.com/128/880/880564.png"/>
                        <img class="h-4 opacity-30" src="https://cdn-icons-png.flaticon.com/128/109/109190.png"/>
                    </div>               
                    </div>
              </div>`
                container.appendChild(paragraph);
    
                // Add username to the usernamesAlreadyInDom array to track it
                usernamesAlreadyInDom.push(participant);
            }
        });
    }
    
    messagesComponent = (username,message)=>{
        return `<div class="flex items-center gap-2">  
                <div class="w-6 h-6 p-1  items-center font-semibold justify-center bg-gray-300 rounded-full">${username.substring(0,1).toUpperCase()}</div>
                <div >
                    <p class="text-xs text-gray-400 pb-1">${username}</p>
                    <p class="text-xs bg-gray-100 px-4 py-1 rounded-lg">${message}</p>
                </div>
              </div>`
    }

    printPrevMessages(data){
        const messagesContainer = document.getElementById("messages-container")
        data.forEach(({message,username}) => {
            messagesContainer.innerHTML += this.messagesComponent(username,message);
          });
        this.printChatMessageCount(data)
    }
    printMessages(data){
        
        const messagesContainer = document.getElementById("messages-container");
        const messagesSuperContainer = document.getElementById("messages-super-container");
        
        messagesContainer.innerHTML = ""; 
        data.forEach(({ message, username }) => {
            messagesContainer.insertAdjacentHTML("beforeend",this.messagesComponent(username,message));
        });
        
        messagesSuperContainer.scrollTop = messagesSuperContainer.scrollHeight;
        this.printChatMessageCount(data)
        
    }

    printMeetingDetails(){
        //select the mobile and tablet screens elements
        const roomNames = document.querySelectorAll('.room-name-header')
        const meetingDates = document.querySelectorAll('.meeting-date-header')
        const meetingRoom=this.getUrlParams('roomId')
        roomNames.forEach((room)=>{
            room.textContent=`Meeting room ${meetingRoom.toUpperCase()}`
        })
        const date = new Date(); // Or new Date('2022-05-20') for a specific date

        const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        });
        meetingDates.forEach((room)=>{
            room.textContent=formattedDate
        })

    }
    getUrlParams(paramName){
        let searchParams = new URLSearchParams(window.location.search);
        let paramValue=searchParams.get(paramName)
        return paramValue.toLowerCase();
    }


    printChatMessageCount = (messages)=>{
        const msgNotification = document.querySelector('#msg-notification')
        msgNotification.textContent=messages.length
    }

    showChatbar(){
        const chatbar = document.querySelector('#chatbar');
        chatbar.classList.add('show-sidebar')
        document.getElementById('close-chat-bar').style.display="block"
        chatbar.classList.remove('hidden')
        
    }
    hideChatbar(){
        document.getElementById('close-chat-bar').style.display="none"
        const chatbar = document.querySelector('#chatbar');
        chatbar.classList.add('hidden')
        chatbar.classList.remove('show-sidebar')
        
    }
}


 // Get references to the video elements and their containers
 const remoteVideo = document.getElementById("remoteVideo");
 const localVideoContainer = document.getElementById("localVideoContainer");
 const smallerVideo = document.querySelector(".smaller-video")
 const mainVideoContainer = document.querySelector("#main-video-container")
 
// JavaScript to play video on load
window.addEventListener("load", function() {
    
    // Try to play the video once it's loaded
    remoteVideo.play().catch(error => {
      console.error("Autoplay prevented:", error);
    });
  });
 
 // Swap sizes between local and remote video when local video is clicked
 mainVideoContainer.addEventListener("click", () => {
   // Toggle classes to swap sizes
   if (localVideoContainer.classList.contains("w-24")) {
     // Make local video large and remote video small
     localVideoContainer.classList.remove("w-24", "h-24", "top-0", "right-0");
     localVideoContainer.classList.add("w-full", "h-full", "relative");

     remoteVideo.classList.remove("w-full", "h-full");
     remoteVideo.classList.add("smaller-video","w-24", "h-24", "absolute", "top-0", "right-0" ,"z-10");
   } else {
     // Revert back to initial sizes
     localVideoContainer.classList.add("w-24", "h-24", "top-0", "right-0");
     localVideoContainer.classList.remove("w-full", "h-full", "relative");

     remoteVideo.classList.add("w-full", "h-full");
     remoteVideo.classList.remove("w-24", "h-24", "absolute", "top-0", "right-0");
   }
 });



function updateVh() {
    // Calculate 1vh in pixels
    let vh = window.innerHeight * 0.01;
    // Set the value in a CSS variable
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  // Run the function initially and on resize
window.addEventListener('resize', updateVh);
// updateVh();
  