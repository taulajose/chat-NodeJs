
$(function () {
    
    const socket = io();

    //obteniendo los elementos del dom

    const messageForm = $('#message-form');
    const messageBox = $('#message');
    const chat = $('#chat');

    const nickForm = $('#nickForm');
    const nickError = $('#nickError');
    const nickname = $('#nickname');
    const users = $('#usernames')

    nickForm.submit(e=>{
        e.preventDefault();
        socket.emit('new user', nickname.val(), function (data){    
            if(data){
                $('#nickWrap').hide();
                $('#contentWrap').show();
                chat.animate({ scrollTop: chat[0].scrollHeight}, 1);
                messageBox.focus();
                messageBox.attr('autocomplete','off')

            }
            else{
                nickError.html(`
                <div class="alert alert-danger">
                Ese usuario ya existe
                </div>`);
            }
        });
        nickname.val('');
    })

    //eventos
    messageForm.submit( e=>{
        e.preventDefault();
        socket.emit('send message',messageBox.val(), data=>{
            chat.append(`<p class="error">${data} </p>`);
           
        });
        messageBox.val('');
    })

    socket.on('new message', data=>{
        chat.append('<b>' + data.nick + '</b> ' + data.msg + '<br/>');
        chat.animate({ scrollTop: chat[0].scrollHeight}, 1);
    });

    socket.on('usernames', data=>{
        let html = '';
        for (let i = 0 ; i< data.length; i++){
            html += `<p> <i class="fas fa-user"></i> ${data[i]} </p>`
        }
        users.html(html)
    });

    socket.on('whisper', data=>{
        chat.append(`<p class="whisper"> <b>${data.nick} <b/> ${data.msg}</p>`);
        chat.animate({scrollTop: chat[0].scrollHeight},1);
    });

    socket.on('load old messages', data=>{
        
        for (let i=0; i < data.length; i++){
            displayMsg(data[i])
            
        }
    })

    function displayMsg(data){
        chat.append(`<p class="whisper"> <b>${data.nick} <b/> ${data.msg}</p>`)
    }
})
