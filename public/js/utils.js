export class Helper{

    name="sy"||prompt('Enter name')
    nameToDisplay;
    roomParticipants=[];
    usernamesAlreadyInDom = [];
    

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
        usernames.forEach(participant => {
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
                        <img class="h-4 opacity-40" src="https://cdn-icons-png.flaticon.com/128/5107/5107435.png"/>
                        <img class="h-4 opacity-30" src="https://cdn-icons-png.flaticon.com/128/880/880564.png"/>
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
    
    printPrevMessages(data){
        const messagesContainer = document.getElementById("messages-container")
        data.forEach(({message,username}) => {
            messagesContainer.innerHTML += `
            <div class="flex items-center gap-2">  
                <div class="w-6 h-6 flex items-center font-semibold justify-center bg-gray-300 rounded-full">${username.substring(0,1).toUpperCase()}</div>
                <div class="">
                    <p class="text-xs text-gray-400 pb-1">${username}</p>
                    <p class="text-xs bg-gray-100 px-4 py-1 rounded-lg">${message}</p>
                </div>
              </div>
            `;
          });
    }
    printMessages(data){

        const messagesContainer = document.getElementById("messages-container");
        const messagesSuperContainer = document.getElementById("messages-super-container");

        messagesContainer.innerHTML = ""; 
        data.forEach(({ message, username }) => {
            messagesContainer.insertAdjacentHTML("beforeend", `
              <div class="flex items-center gap-2">  
                <div class="w-6 h-6 flex items-center font-semibold justify-center bg-gray-300 rounded-full">
                  ${username.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <p class="text-xs text-gray-400 pb-1">${username}</p>
                  <p class="text-xs bg-gray-100 px-4 py-1 rounded-lg">${message}</p>
                </div>
              </div>
            `);
          });

          messagesSuperContainer.scrollTop = messagesSuperContainer.scrollHeight;

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
        return paramValue;
    }


    showChatbar(){
        const chatbar = document.querySelector('#chatbar');
        chatbar.classList.add('show-sidebar')
        document.getElementById('close-chat-bar').style.display="block"
        
    }
    hideChatbar(){
        document.getElementById('close-chat-bar').style.display="none"
        const chatbar = document.querySelector('#chatbar');
        chatbar.classList.remove('show-sidebar')
    }
}


 // Get references to the video elements and their containers
 const remoteVideo = document.getElementById("remoteVideo");
 const localVideoContainer = document.getElementById("localVideoContainer");
 const smallerVideo = document.querySelector(".smaller-video")
 const mainVideoContainer = document.querySelector("#main-video-container")
 

 
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