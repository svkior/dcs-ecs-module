function DcsLnxWorker(srv, eventBus){
    console.log();
    var conn = $('.console');
    var menuBtns = $('.menu');
    menuBtns.empty();

     var cmds = [];

    function writeToConsole(text){
        conn.val(text);
    }

    function addButton(name, acT){
        var li = $('<li>');
        var doStuff = function(){
            if(typeof acT !== 'undefined'){
                acT();
            } else {
                console.log('No Action!')
            }
            return false;
        };
        $('<a>').attr('href','#').addClass('btn').addClass('btn-info').text(name).on('click', doStuff).appendTo(li);
        li.appendTo(menuBtns);
    }


    writeToConsole('Hello, World');

    addButton('Login', function(){
        conn.empty();
        eventBus.send('dcslnx.execute',{
            server: srv.ip,
            login: srv.user,
            pass: srv.upass,
            cmd: 'echo Hello, World!'
        }, function(resp){
           console.log(resp);
            if(resp.status === "ok"){
                writeToConsole(resp.result);
            }
        });
    });

    svkAddLI({
        ul: menuBtns,
        text: "Команда",
        iVal: "echo Test",
        cb: function(val){
            console.log('Test');
            eventBus.send('dcslnx.execute',{
                server: srv.ip,
                login: srv.user,
                pass: srv.upass,
                cmd: val
            }, function(resp){
                console.log(resp);
                if(resp.status === "ok"){
                    conn.empty();
                    writeToConsole(resp.result);
                }
            });
        }
    });

    /*
    addButton('Напинать комманд', function (){
        var command = {
            cmd:"dpkg -L | grep bash"
        };
        cmds.push(command);
    });



    addButton('Расфигачить', function() {
        conn.empty();
        $.each(cmds, function() {
            eventBus.send('dcslnx.execute',{
                server: srv.ip,
                login: srv.user,
                pass: srv.upass,
                cmd: this.cmd
            }, function(resp){
                console.log(resp);
                if(resp.status === "ok"){
                    writeToConsole(resp.result);
                }
            });

        });
        cmds.empty();
    });

      */


}