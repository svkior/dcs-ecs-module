function MysqlReader(server, eventBus){
    var ed = $('.reader');
    ed.empty();
    var status = $('<strong>').text('Connecting to ' + server.ip);
    status.appendTo(ed);
    eventBus.send('ecs.login', {ip:server.ip}, function(resp){
        console.log('ECS connected to : ' + server.ip);
    });
    eventBus.send('ftp.login', {ip:server.ip}, function(resp){
        console.log('ECS connected to : ' + server.ip);
    });
    eventBus.send('dataserver.login',{ip:server.ip}, function(resp){
        console.log('server opened');
        status.text('Connected to ' + server.ip);
        $('.servers').empty();
        $('.logout').on('click', function(){
            eventBus.send('dataserver.logout', {}, function(res){
                console.log('Logout: ');
                console.log(res);
                ed.empty();
                refreshServers();
                return false;
            });
        });
        console.log(resp);
        eventBus.send('dataserver.getgroups', {}, function(response){
            //console.log('DATA from getgroups');
            //console.log(response);
            var ul = $('<ul></ul>').appendTo(ed);

            $.each(response.data, function(){
                if(this.DriveID){
                    var DriveID = this.DriveID;
                    var DriveGroup = this.ID;
                    var DriveName = this.Comment;
                    eventBus.send('dataserver.getconnection', {DriveID:DriveID}, function(res){
                        console.log('!!!!!!!!');
                        console.log(res.data[0]);
                        var Addr = res.data[0].Param & 0xff;
                        var Bus = res.data[0].Param >>> 16;

                        var shDP = undefined;
                        var shDC = undefined;
                        var showParams = function(){
                             new showDriveParams(DriveID, DriveName, eventBus);
                             new showDriveCtrl(DriveID, DriveName, DriveGroup, Addr, Bus, eventBus);
                            return false;
                        };

                        var li = $('<li>');
                        li.text('B:' + Bus + ',A:'+ Addr + ' : ');
                        $('<a>').text(DriveName).attr('href','#').on('click', showParams).appendTo(li);
                        li.appendTo(ul);
                    });
                }
            })
        });

        return false;
    });

}