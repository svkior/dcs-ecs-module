/**
 * Created by svkior on 18/02/14.
 */

var console = require('vertx/console');
var eventBus = require('vertx/event_bus');

var FtpWorker = Packages.ru.scircus.mech.GetFTPTelemetry;

var ftpTelemetry = undefined;
var ip = undefined;

eventBus.registerHandler('ftp.login', function(args, responder){
    ip = args.ip;
    ftpTelemetry = new FtpWorker(ip);
    responder({status: 'ok'});
});


eventBus.registerHandler('ftp.update', function(args, responder){

    var oldPP = new java.io.File('./working/' + ip + '/drive_' + args.DriveID + '_' + args.Bus + '_' + args.Addr);
    oldPP['delete']();

    ftpTelemetry.updateTelemetry(
        java.lang.Integer(args.DriveID), // Drive Number
        java.lang.Integer(args.Bus),
        java.lang.Integer(args.Addr)
    );

    responder({status: 'ok'});
});

eventBus.registerHandler('ftp.load', function(args, responder){

    ftpTelemetry.loadTelemetry(
        java.lang.Integer(args.DriveID), // Drive Number
        java.lang.Integer(args.Bus),
        java.lang.Integer(args.Addr)
    );

    var vals = ftpTelemetry.getSensVal();
    var trajv = ftpTelemetry.getTrgenVal();
    var ustv   = ftpTelemetry.getRegVal();
    var encoder = ftpTelemetry.getEncoder();


    var telem = [];
    var traj = [];
    var ust = [];
    var enc = [];

    try {
        for(var i=0; i<vals.size(); i++){
            telem[i] = vals.get(i);
            traj[i] = trajv.get(i);
            ust[i] = ustv.get(i);
            enc[i] = encoder.get(i);
        }


    } catch (e){
        console.log('Никуда не ездили');
    }

    responder({
        status: 'ok',
        data: telem,
        traj: traj,
        ust: ust,
        enc: enc
    });

});


console.log('FTP Worker Vertex launched');
