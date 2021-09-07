const { decode } = require("./jwt");

class sockSrv{
    /**
     * @type {import("socket.io").Socket}
     */
    static _io_;
    /**
     * @type {Array<import("socket.io").Socket>}
     */
    static userList = [];
    static init = function(){
        sockSrv._io_.on("connection",sockSrv.onConnection)
    }
    /**
     * 
     * @param {import("socket.io").Socket} socket 
     */
    static onConnection(socket){
        console.log("new user connected");
        if(socket.handshake.query.token){
            const user = decode(socket.handshake.query.token);
            socket.user = user;
            sockSrv.userList.push(socket);
            sockSrv.userList.forEach(x=>{
                if(x.connected){
                    x.emit("connect"+sockSrv.user["id"],"user connected");
                }
            })
            socket.on("message",(data)=>{
                const sockets = sockSrv.userList.filter(x=>x.user["id"]==data.reciever);
                if(sockets.length>0){
                    sockets.forEach(x=>{
                        if(x.connected){
                            x.emit("message",data);
                        }
                    })
                }
            })
            socket.on("disconnect",()=>{
                sockSrv.userList.forEach(x=>{
                    if(x.connected){
                        x.emit("disconnect"+sockSrv.user["id"],"user disconnected");
                    }
                })
            })
        }
    }
    static sendMessageNotification(data){
        const sockets = sockSrv.userList.filter(x=>x.user["id"]==data.reciever);
        if(sockets.length>0){
            sockets.forEach(x=>{
                if(x.connected){
                    x.emit("message",data);
                }
            })
        }
    }
}
module.exports = {sockSrv}