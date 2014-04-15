var runApp = function(){
    var serv = $('.serv');

    var renderServerList = function(server){
        //console.log(server.name);
        var li = $('<li>');
        var chooseServer = function(){
            new DcsLnxWorker(server, eb);
            serv.empty();
            return false;
        };
        $('<a>').attr('href','#').text(server.name).on('click', chooseServer).appendTo(li);
        li.appendTo(serv);
    };

    eb.send('dcslnx.getservers',{}, function(resp){
        $.each(resp.data, function(){
            renderServerList(this)
        });
    });
}