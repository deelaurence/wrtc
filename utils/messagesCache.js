'use strict';
export class MessagesCache{
    roomMessages= new Map();
    roomUsers=new Map();

    setMessages(roomId,messages){
        try {
            // console.log(this.roomMessages.has(roomId)))!
            if(!this.roomMessages.has(roomId)){
                this.roomMessages.set(roomId,[])
            }
            let previousMessages=this.getMessages(roomId)
            previousMessages.push(messages)
        } catch (error) {
            console.error(error)
        }
    }

    getMessages(roomId){
        return this.roomMessages.get(roomId)
    }


    setRoomUsers(roomId,user){
        try {
            // console.log(this.roomMessages.has(roomId)))!
            if(!this.roomUsers.has(roomId)){
                this.roomUsers.set(roomId,[])
            }
            let previousUsers=this.getRoomUsers(roomId)
            previousUsers.push(user)
        } catch (error) {
            console.error(error)
        }
    }

    getRoomUsers(roomId){
        return this.roomUsers.get(roomId)
    }
    
}

