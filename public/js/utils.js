export class Helper{

    name=prompt('Enter name')
    roomParticipants;
    
    printName(){
        document.querySelector('.name').textContent=this.name
    }
    
    printRoomParticipant(){
        const container = document.querySelector('.participants')
        this.roomParticipants.forEach(participant => {
            const paragraph = document.createElement('p')
            paragraph.textContent=participant.username
            paragraph.classList.add('text-white')
            container.appendChild(paragraph)
        })
    }
    getUrlParams(paramName){
        let searchParams = new URLSearchParams(window.location.search);
        let paramValue=searchParams.get(paramName)
        return paramValue;
    }
}