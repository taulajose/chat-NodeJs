const Chat = require('./models/chat')


module.exports = function (io){

    let users = {};
    io.on('connection', async socket =>{
        console.log('nuevo usuario conectado');
        let messages = await Chat.find({});
        
        socket.emit('load old messages', messages);


        socket.on('new user', (data,cb)=>{
            if (data in users){
                cb(false);
            }
            else{
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                io.sockets.emit('usernames',Object.keys(users));
            }
           
        })
    
        socket.on('send message', async (data,cb)=>{
            
            var msg = data.trim();
            
            if (msg.substr(0,3) === '/p '){
                msg = msg.substr(3);
                console.log(msg)
                const index = msg.indexOf(' ');
                
                if (index !== -1){
                    var name = msg.substring(0, index);
                    var msg = msg.substring(index + 1);
                    if (name in users){
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    }
                    else{
                        cb('Error please ingresa un usuario valido')
                    }
                } else{
                    cb('Error ingresa tu mensaje')
                }
            } else{

               await new Chat({
                    msg: msg,
                    nick: socket.nickname
                }).save();

                    io.sockets.emit('new message', {
                        msg: data,
                        nick: socket.nickname
                    });
                    }
        });

        socket.on('disconnect', data=>{
            if(!socket.nickname) return;
            delete users[socket.nickname];
            io.sockets.emit('usernames',Object.keys(users));
        })
    });

    
    
    } 