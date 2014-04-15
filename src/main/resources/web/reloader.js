state = 'wait';

svkAddLI = function(params){
    var li = $('<li>').text(params.text + " : ");
    var inp = $('<input>');
    inp.val(params.iVal).addClass('edit');
    inp.bind('keypress', function(e){
        if(e.keyCode == 13){
            if(params.cb !== 'undefined'){
                params.cb(inp.val());
            }
            return false;
        }
    }).appendTo(li);
    li.appendTo(params.ul);
    return inp;
};


var onConect = function(){
    if(state == 'reconnect'){
        state = 'reload';
        eb.close();
    } else {
        state = 'wait';
        console.log('CONNECTED');
        eb.send('server.getver', {}, function(resp){
            var rld = $('.reloader');
            rld.empty();
            rld.text('| Текущая версия от ' + resp.version + ' | ');

            $('<a>').attr('href','#').text('ОБНОВИТЬ').on("click",function(){
                console.log('Clicked');
                eb.send('server.reboot',{}, function(){
                    console.log('Reboot Request Sended!');
                });
                return false;
            }).appendTo(rld);

            if(typeof runApp !== 'undefined'){
                runApp();
            } else {
                console.log('There is no application')
            }
        });

    }
};

var forceReconnect = function () {
    if(state=='reload'){
        state = 'canreload';
        location.reload(true);
    }else {
        state = 'reconnect';
        console.log('DISCONNECT!!!!!!');
        var ppp = $('.servers').empty();
        $('.status').empty();
        ppp.empty();
        $('<h1>').text('Reconnecting...').appendTo(ppp);

    }
};

var eb = new vertx.EventBus(window.location.protocol + '//' +window.location.hostname + ':' +window.location.port + '/eventbus');
eb.onopen = onConect;
eb.onclose = forceReconnect;



var idx = 0;
(function worker() {
    switch(state){
        case 'reconnect':
            if(eb.readyState() == 3){
                eb = new vertx.EventBus(window.location.protocol + '//' +window.location.hostname + ':' +window.location.port + '/eventbus');
                eb.onopen = onConect;
                eb.onclose = forceReconnect;
            }
            break;
    }
    setTimeout(worker, 5000);
})();
