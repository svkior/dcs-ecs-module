/**
 * Created by svkior on 17/02/14.
 */
var console = require('vertx/console');

console.log('Mysql Dataserver Vertex launched');

var eventBus = require('vertx/event_bus');

eventBus.registerHandler('dataserver.getservers', function(args, responder){
   responder({
       data:[
           {
               ip: '127.0.0.1',
               name: 'ЛокСер'
           },
           {
               ip: "192.168.3.2",
               name: 'ECS Мастер на объекте'
           },
           {
               ip: "192.168.100.98",
               name: 'ОрловСерVPN'
           },
           {
               ip: "192.168.99.241",
               name: 'ОрловСер'
           },
           {
               ip: "192.168.100.26",
               name: "Konstantin"
           },
           {
               ip: "10.211.55.6",
               name: 'SVKior EMU'
           }
       ]
   })
});

var mysql = undefined;

eventBus.registerHandler('dataserver.login', function(args, responder){
    var e;
    if(!mysql){
        console.log('wants to login ' + args.ip);

        try {
            mysql =
                Packages.java.sql.DriverManager.getConnection("jdbc:mysql://" + args.ip + "/dataserver?" +
                    "user=root&password=1");

        } catch (e) {
            console.log(e);
            mysql = undefined;
        }

        if(mysql){
            console.log('Connected');
            responder({status:'ok'})
        } else {
            mysql = undefined;
            responder({
                status: 'error',
                data: e.getMessage()
            });
        }
    } {
        responder({status:'ok'});
    }
});

eventBus.registerHandler('dataserver.logout', function( args, responder){
    console.log('LOGOUT');
    if(mysql){
        mysql = undefined;
        responder({status: "ok"});
    } else {
        responder({status: "ok"});
    }
});

function executeMysql(query, cbr){
    var stmt = mysql.createStatement();
    console.log('Try QUERY: ' + query);
    var rs = stmt.executeQuery(query);
    var meta = rs.getMetaData();
    var data = [];
    while( rs.next() ) {
        var row = {};
        for( var i = 1; i <= meta.getColumnCount(); i++ ) {
            console.log( meta.getColumnName( i ) + ": " + rs.getObject( i ) );
            row[meta.getColumnName(i)] = rs.getObject(i);
        }
        console.log( "----------" );
        data.push(row);
    }
    console.log('finish');
    cbr(data);

}

function executeUpdateMysql(query, cbr){
    var stmt = mysql.createStatement();
    console.log('Try QUERY: ' + query);
    var i = stmt.executeUpdate(query);
    cbr(i);
}


eventBus.registerHandler('dataserver.getgroups', function(args, responder){
    console.log('Wants to select');
    var dat;
    executeMysql( "select id,Comment from groups", function(data){
        dat = data;
        for(var i=0; i<data.length; i++){
            var qq = "select GroupID,DriveID from drvgrp where GroupID=" + data[i].ID;
           executeMysql(qq, function(dd){
               if(dd.length>0){
                   for(var j=0; j<data.length; j++){
                       //console.log(data[j].ID + '   ' + dd[0].GroupID);
                       if(data[j].ID == dd[0].GroupID){
                           data[j].DriveID = dd[0].DriveID;
                           if( j === (data.length -1)){
                               responder({
                                   query: 'ok',
                                   data: data
                               });
                           }
                       }
                   }
               }
           });
        }
    });
});

eventBus.registerHandler('dataserver.getdriveparam', function(args, responder){
    console.log('Get params for drive ' + args.DriveID);
    executeMysql( "select * from drives where ID=" + args.DriveID, function(data){
        responder({
            query: 'ok',
            data: data
        });
    });
});

eventBus.registerHandler('datasever.driveparameterupdate', function(args, responder){
    console.log('Change drive N'+ args.DriveID + ' parameter '+ args.param + ' to ' + args.value);
    executeUpdateMysql('UPDATE drives SET ' + args.param + '=' + args.value + ' WHERE ID=' +args.DriveID,
    function (data){
        responder({
            query: 'ok'
        });
    });
});

eventBus.registerHandler('dataserver.getconnection', function(args, responder){
    var DriveID = args.DriveID;
    executeMysql("select c.param from connections c, drives d where d.id = " + DriveID + " and d.connectionID=c.id",
    function(data){
        responder({
            status: 'ok',
            data: data
        })
    });
});
