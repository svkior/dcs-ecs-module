/**
 * Created by svkior on 10.02.14.
 */
var vertx = require('vertx');
var console = require('vertx/console');


exports.getLnx= function(comPort){
    var lnx = {};
    lnx.comPort = comPort;

    lnx.start = function(cbEnd) {
        this.state_m = 'open';
        this.rv = '';
        this.cbEnd = cbEnd;
        var lLnx = this;
        this.timer = vertx.setPeriodic(100, function(id){

            switch(lLnx.state_m){
                case 'open':
                    try {
                        lLnx.sp = Packages.jssc.SerialPort(lLnx.comPort);
                        lLnx.sp.openPort();
                        lLnx.sp.setParams(115200, 8, 1, 0);
                        var bc1 = lLnx.sp.getInputBufferBytesCount();
                        if(bc1 >0){
                            lLnx.sp.readString(bc1,0);
                        }
                        lLnx.state_m = 'bootstrap';
                    } catch (e){
                        console.log('Error::: ' + e);
                        lLnx.state_m = 'error';
                    }
                    break;
                case 'bootstrap':
                    // Initial bootstrap
                    // Send 'Enter' wait for
                    console.log('GOT Bootstrap');
                    lLnx.state_m = 'finish';
                    break;
                default:
                    console.log('Finish');
                    vertx.cancelTimer(id);
                    if(lLnx.cbEnd){
                        lLnx.cbEnd();
                    }

            }

        });

    };

    lnx.close = function(){
        console.log("Closing linux");
        try {
            this.sp.closePort();
        } catch (e){

        }
    };
    return lnx;
};