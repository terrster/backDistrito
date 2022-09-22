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

          // console.log("New user connected!");

          if(socket.handshake.query.idU){
            let userExist = this.users.find(user => user.idU == socket.handshake.query.idU);

            if(userExist){
              this.io.to(userExist.socketId).emit('forceDisconnect', {});
            }

            this.users.push({
                idU : socket.handshake.query.idU,
                socketId: socket.id
            });
            // console.log(this.users);

            socket.on('disconnect', () => {
                // console.log("One user disconnected!");
                this.users = this.users.filter(user => user.socketId != socket.id);
        
                // console.log(this.users);
            });
          }
          else if(socket.handshake.query.origin == 'hubspotInfo'){
            if(require('fs').existsSync(require('path').resolve('config/hubspotInfo.json'))){
              let data = JSON.parse(require('fs').readFileSync(require('path').resolve('config/hubspotInfo.json')));
              socket.emit('hubspotInfo', {
                data,
                difference: []
              });
            }
          }

          socket.on('getHubspotInfo', () => {
            if(require('fs').existsSync(require('path').resolve('config/hubspotInfo.json'))){
              let data = JSON.parse(require('fs').readFileSync(require('path').resolve('config/hubspotInfo.json')));
              socket.emit('hubspotInfo', {
                data,
                difference: []
              });
            }
          });
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
    // console.log(this.users);
  }

  /*
    Functions in order to be able to call a socket event from outside
    
    Previously you should have setted a global variable for the socket in the function initialize from server.js
    Example: global.io = new socket();

    Otherwise you just have available the basic functions to hear a socket event but not from outside
  */

  getUser(idFinerio){
    if(idFinerio)
      return this.users.find(user => user.idFinerio == idFinerio);
  }

  getUsers(){
    return this.users;
  }

  emitToSocket(socketId, event, data){
    console.log(`Socket event ${event} emitted to socket ${socketId}`);
    if(socketId && event && data)
      try{
        this.io.to(socketId).emit(event, data);
      } catch(error){
        console.log(error);
      }
  }

  emitToAll(event, data){
    if(event, data)
      this.io.emit(event, data);
  }

}

module.exports = SocketService;