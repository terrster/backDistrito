'use strict'

/*
|  emit: send an event to every single socket 
|  broadcast: send an event to every single socket except the origin
|  to/in: send an event to specific room socket joined
*/

const socketIo = require('socket.io');

class SocketService {

  constructor(server) {
    this.io = socketIo(server);
    this.users = {};

    this.io.on('connection', socket => {

        console.log("New user connected!");
        this.users[socket.id] = {
            idU : socket.handshake.query.idU
        }
        console.log(this.users);

        socket.on('disconnect', () => {
            console.log("One user connected!");
            delete this.users[socket.id];
    
            console.log(this.users);
        })
    });
  } 

  //Functions in order to be able to call a socket event from outside

  emit(event, data){
    if(data)
      this.io.emit(event, data);
  }

  
}

module.exports = SocketService;