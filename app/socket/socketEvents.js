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
    this.users = [];
    this.initializeGlobalEvents();
  } 

  initializeGlobalEvents(){
    try{
      this.io.on('connection', socket => {

          console.log("New user connected!");
          this.users.push({
              idU : socket.handshake.query.idU,
              socketId: socket.id
          })
          console.log(this.users);

          socket.on('disconnect', () => {
              console.log("One user disconnected!");
              this.users = this.users.filter(user => user.socketId != socket.id);
      
              console.log(this.users);
          })
      });

      console.log(`Socket service initialized successfully`);
    }
    catch(error){
      console.log("Something went wrong trying to initialize the socket service");
    }
  }

  setIdFinerio(idU, idFinerio){
    let index = this.users.findIndex(user => user.idU == idU);
    this.users[index].idFinerio = idFinerio;
    console.log(this.users);
  }

  /*
    Functions in order to be able to call a socket event from outside
    
    Previously you should have setted a global variable for the socket in the function initialize from server.js
    Example: global.io = new socket();

    Otherwise you just have available the basic functions to hear a socket event but not from outside
  */

  getUser(idFinerio){
    return this.users.find(user => user.idFinerio == idFinerio);
  }

  emitToSocket(socketId, event, data){
    if(socketId && data)
      this.io.to(socketId).emit(event, data);
  }

}

module.exports = SocketService;