/**
 * Created by svkior on 20/02/14.
 */
var console = require('vertx/console');

console.log('DCSLNX Vertex Launched');

var eventBus = require('vertx/event_bus');

eventBus.registerHandler('dcslnx.getservers', function(args, responder){
    responder({
        data:[
            {
                ip: '127.0.0.1',
                name: 'Локальный Сервер'
            },
            {
                ip: "10.211.55.12",
                name: 'Тестовый КСВ',
                user: "user",
                upass: "1",
                rpass: '1'
            },
            {
                ip: "192.168.100.98",
                name: 'Орловский Сервер VPN'
            },
            {
                ip: "192.168.99.241",
                name: 'Орловский Сервер'
            }
        ]
    })
});

eventBus.registerHandler('dcslnx.execute', function(args, responder){
    console.log('SSH ');
    try {

        // http://www.feyrer.de/NetBSD/xdev.html
        console.log('Server : ' + args.server);
        console.log('Login : ' + args.login);
        console.log('Cmd : ' + args.cmd);

        var ssh = new Packages.ru.ttsy.Sshlib(
            args.server,
            args.login,
            args.pass,
            args.cmd
        );
        ssh.Run();
        var result = ssh.getResult();
        responder({
            status: 'ok',
            result: result
        });

    } catch (e){
        console.log(e);
        responder({
            status: 'error',
            message: e.message
        });
    }
});