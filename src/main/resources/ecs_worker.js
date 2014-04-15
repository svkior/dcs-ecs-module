/**
 * Created by svkior on 14/02/14.
 */

var console = require('vertx/console');
var eventBus = require('vertx/event_bus');
var vertx = require('vertx');

console.log('ECS Worker');

var channel;
if(!channel){
    channel = Packages.java.nio.channels.DatagramChannel.open();
    channel.socket().bind(Packages.java.net.InetSocketAddress(1701));
}
var ecsAddr = Packages.java.net.InetSocketAddress("192.168.99.241", 1350);

function SendUDPPacket(cmd, params){
    var parLen = params.length;
    var pultId = 5;
    var pktSize = 12 + parLen*4;

    var buf = Packages.java.nio.ByteBuffer.allocate(pktSize);
    buf.putInt(pultId);
    buf.putInt(cmd);
    buf.putInt(parLen*4);
    for(var i=0; i< parLen; i++){
        buf.putInt(params[i]);
    }
    channel.send(buf, ecsAddr);

}

var v = Packages.ru.scircus.mech.UDPWorker;

var UDPWorker1 = undefined;

eventBus.registerHandler('ecs.login', function(args, responder){
    UDPWorker1 = new v(args.ip);

    responder({status: "ok"});
});

eventBus.registerHandler('ecs.position', function(args, responder){
    var position = java.lang.Integer(args.position);
    var groupNumber = java.lang.Integer(args.DriveGroup);

    UDPWorker1.SendPacket(503,[groupNumber,position]); // Сброс позиции в 0

});

eventBus.registerHandler('ecs.go', function(args, responder){


    var oneWay = args.oneWay;
    var powerOff = args.powerOff;

    var driveNumber = java.lang.Integer(args.DriveID);
    var groupNumber = java.lang.Integer(args.DriveGroup);
    var delayTime = java.lang.Integer(args.delayTime);

    var zero = java.lang.Integer(0);

    var maxL = java.lang.Integer(args.L);
    var mmaxL = java.lang.Integer(-args.L);
    var maxV = java.lang.Integer(args.V);
    var maxA = java.lang.Integer(args.A);
    var maxSpeed = java.lang.Integer(1000);

    console.log(maxL + ', ' + mmaxL);

    UDPWorker1.SendPacket(2000,[driveNumber, zero]); //Перезаливка параметров в привод
    UDPWorker1.SendPacket(320,[zero,zero]); // Активация Общего ручного режима
    UDPWorker1.SendPacket(321,[groupNumber]);   // Ввод в группу привода
    UDPWorker1.SendPacket(510,[groupNumber]);  // Активировать привод
    UDPWorker1.SendPacket(312, [groupNumber]);
    //UDPWorker1.SendPacket(503,[groupNumber,zero]); // Сброс позиции в 0
    // NOT WORK
    //UDPWorker1.SendPacket(504,[zero, groupNumber]); // Сброс позиции в 0
    vertx.setTimer(2000, function(){
        console.log('Going UP ...');
        UDPWorker1.SendPacket(330,[maxV,maxA,maxL,groupNumber]); // Движение V/1000, A/1000, L/1000
        UDPWorker1.SendPacket(313,[maxSpeed]);
        vertx.setTimer(delayTime, function() {
            if(oneWay){
                console.log('STOP');
                if(powerOff){
                    UDPWorker1.SendPacket(324,[groupNumber]); // Выключение питания привода
                }
                responder({status: 'ok'});
            } else {
                console.log('Going DOWN ...');
                UDPWorker1.SendPacket(330,[maxV,maxA,mmaxL,groupNumber]); // Движение V/1000, A/1000, L/1000
                UDPWorker1.SendPacket(313,[maxSpeed]);
                vertx.setTimer(delayTime, function() {
                    console.log('STOP');
                    if(powerOff){
                        UDPWorker1.SendPacket(324,[groupNumber]); // Выключение питания привода
                    }
                    responder({status: 'ok'});
                });
            }
        });
    });
    console.log('YOHOHO!');
});

