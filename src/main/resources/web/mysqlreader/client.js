var state = 'wait';

var refreshServers = function(){
    if(state == 'reconnect'){
        state = 'reload';
        eb.close();
    } else {
        state = 'wait';
        console.log('CONNECTED');
        $('.servers').empty();
        $('.reader').empty();
        $('.params').empty();
        $('.pp').empty();

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

        });

        var renderListItem = function(server){
            var li = $('<li>');
            var openServer = function(){
                new MysqlReader(server, eb);
                return false;
            };

            $('<a>').text(server.ip).attr('href','#').on('click', openServer).appendTo(li);
            $('<strong>').text(' -  '+ server.name).appendTo(li);
            li.appendTo('.servers');
        };

        eb.send('dataserver.getservers',{}, function(res){
            $('.servers').empty();
            $.each(res.data, function(){ renderListItem(this)});
        });
    }
};

var forceReconnect;
forceReconnect = function () {
    if(state=='reload'){
        state = 'canreload';
        location.reload(true);
    }else {
        state = 'reconnect';
        console.log('DISCONNECT!!!!!!');
        var ppp = $('.servers').empty();
        $('.reader').empty();
        ppp.empty();
        $('<h1>').text('Reconnecting...').appendTo(ppp);

    }
};

var eb = new vertx.EventBus(window.location.protocol + '//' +window.location.hostname + ':' +window.location.port + '/eventbus');
eb.onopen = refreshServers;
eb.onclose = forceReconnect;



var idx = 0;
(function worker() {
//    console.log('WORKER:' + idx++);
    switch(state){
        case 'reconnect':
//            console.log('UP!!!!');
//            console.log(eb.readyState());
            if(eb.readyState() == 3){
                eb = new vertx.EventBus(window.location.protocol + '//' +window.location.hostname + ':' +window.location.port + '/eventbus');
                eb.onopen = refreshServers;
                eb.onclose = forceReconnect;
            }
            break;
    }
    setTimeout(worker, 5000);
})();