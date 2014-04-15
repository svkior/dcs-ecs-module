/**
 * Created by svkior on 27.02.14.
 */
function showDriveCtrl(DriveID, DriveName, DriveGroup, Addr, Bus, eventBus){

    console.log('Drive Controls');
    var pp = $('.pp');
    pp.empty();
    var ul = $('<ul>');
    var ul2 = $('<ul>');
    var graph = $('<div>');
    var graph2 = $('<div>');
    var curData = [];
    var curTraj = [];
    var curSpeed = [];
    var curSpeedT = [];
    var curAccel = [];
    var curAccelT = [];
    var oldData = [];
    var oldTraj = [];
    var oldSpeed = [];
    var oldSpeedT = [];
    var oldAccel = [];
    var oldAccelT = [];

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }


    var cbPing = function(){
        var meanSpeed = 0;
        for(var i=begMean; i<= endMean; i++){
            meanSpeed += curSpeed[i];
        }
        meanSpeed = meanSpeed / (endMean - begMean + 1);
        meanOne.text('Среднее Ск: ' + meanSpeed);
        return false;
    };

    var DriveGO = function(cb){
        console.log('DRIVE');
        goBtn.attr('disabled','disabled');
        eventBus.send('ecs.go',{
            DriveID:DriveID,
            DriveGroup:DriveGroup,
            delayTime: delayTime,
            L: L,
            V: V,
            A: A,
            oneWay: oneWay,
            powerOff: powerOff // TODO: Passthrough it to UI
        }, function(res){
            console.log('GOT RESPAWN!');
            goBtn.removeAttr('disabled');
            if(isFunction(cb)){
                cb();
            }
        });
        cbPing();
    };

    var GetFTP = function(cb){
        console.log('Get FTP');
        ftpBtn.attr('disabled','disabled');
        eventBus.send('ftp.update',{
            DriveID:DriveID,
            Bus:Bus,
            Addr:Addr
        }, function(res){
            console.log(res);
            ftpBtn.removeAttr('disabled');
            if(isFunction(cb)){
                cb();
            }
        });
        cbPing();
    };

    var PlotGraph = function(cb) {
        plotBtn.attr('disabled','disabled');

        console.log('Plot Graph');
        eventBus.send('ftp.load', {
            DriveID:DriveID,
            Bus:Bus,
            Addr:Addr
        }, function(res){
            console.log(res);

            oldData = curData;
            oldTraj = curTraj;
            oldSpeed = curSpeed;
            oldSpeedT = curSpeedT;
            oldAccel = curAccel;
            oldAccelT = curAccelT;

            curSpeed = [];
            curSpeedT = [];
            curAccel = [];
            curAccelT = [];

            curData = res.data;
            curTraj = res.traj;
            curUst = res.ust;
            curSpeed[0] = 0;
            curSpeedT[0] = 0;
            curAccel[0] = 0;
            curAccelT[0] = 0;
            for(var i=1; i<(curData.length); i++){
                curSpeed[i] = (curData[i] - curData[i-1])/0.025;
                curSpeedT[i] = (curTraj[i] - curTraj[i-1])/0.025;
                curAccel[i] = (curSpeed[i] - curSpeed[i-1])/0.025;
                curAccelT[i] = (curSpeedT[i] - curSpeedT[i-1])/0.025;
            }
            if(endMean == 0){
                endMean = curData.length;
            }
            if(skipLast == 0){
                skipLast = curData.length;
            }
            currentPlot();
            plotBtn.removeAttr('disabled');
            if(isFunction(cb)){
                cb();
            }
        });
        cbPing();
    };

    var /**
     * @return {boolean}
     */
        DoAll = function(){
        allBtn.attr('disabled','disabled');
        ftpBtn.attr('disabled','disabled');
        plotBtn.attr('disabled','disabled');
        goBtn.attr('disabled','disabled');

        GetFTP( function(){
            ftpBtn.attr('disabled','disabled');
            DriveGO(
                function(){
                    GetFTP(
                        function(){
                            PlotGraph(function(){
                                allBtn.removeAttr('disabled');
                            });
                        }
                    );
                }
            );
        });
        return false;
    };

    var MyPlot1 = function(tx1, dat1){
        graph.width(800).height(600);
        graph2.empty();
        var options = {
            series: {
                lines: { show: true },
                points: { show: drawDots }
            }
        };

        var data =[
            { label: tx1, data: [ ] }
        ];
        var begin1 = zeroStart ? dat1[0] : 0;

        var dataEnd = skipLast > dat1.length ? dat1.length : skipLast;
        for(var i=0; i<(dataEnd-skipFirst); i++){
            data[0].data[i] = [(i+skipFirst)*0.025, dat1[i+skipFirst] - begin1];
        }
        $.plot(graph, data, options);
    };

    var MyPlot2 = function(tx1, dat1, tx2, dat2){
        graph.width(800).height(600);
        graph2.empty();
        var options = {
            series: {
                lines: { show: true },
                points: { show: drawDots }
            }
        };

        var data =[
            { label: tx1, data: [ ] },
            { label: tx2, data: [ ]}
        ];
        var begin1 = zeroStart ? dat1[0] : 0;
        var begin2 = zeroStart ? dat2[0] : 0;

        var dataEnd = skipLast > dat1.length ? dat1.length : skipLast;
        for(var i=0; i<(dataEnd-skipFirst); i++){
            data[0].data[i] = [(i+skipFirst)*0.025, dat1[i+skipFirst] - begin1];
            data[1].data[i] = [(i+skipFirst)*0.025, dat2[i+skipFirst] - begin2];
        }
        $.plot(graph, data, options);
    };

    var MyPlot4 = function(tx1, dat1, tx2, dat2, tx3, dat3, tx4, dat4){
        graph.width(800).height(600);
        graph2.empty();
        var options = {
            series: {
                lines: { show: true },
                points: { show: drawDots }
            }
        };

        var data =[
            { label: tx1, data: [ ] },
            { label: tx2, data: [ ]},
            { label: tx3, data: [ ] },
            { label: tx4, data: [ ]}
        ];
        var begin1 = zeroStart ? dat1[0] : 0;
        var begin2 = zeroStart ? dat2[0] : 0;
        var begin3 = zeroStart ? dat3[0] : 0;
        var begin4 = zeroStart ? dat4[0] : 0;


        var dataEnd = skipLast > dat1.length ? dat1.length : skipLast;

        for(var i=0; i<(dataEnd-skipFirst); i++){
            data[0].data[i] = [(i+skipFirst)*0.025, dat1[i+skipFirst] - begin1];
            data[1].data[i] = [(i+skipFirst)*0.025, dat2[i+skipFirst] - begin1];
            data[2].data[i] = [(i+skipFirst)*0.025, dat3[i+skipFirst] - begin1];
            data[3].data[i] = [(i+skipFirst)*0.025, dat4[i+skipFirst] - begin1];
        }
        $.plot(graph, data, options);
    };


    var MyPlotDiff = function(tx1, dat1, dat2){
        graph.width(800).height(600);
        graph2.empty();
        var options = {
            series: {
                lines: { show: true },
                points: { show: drawDots }
            }
        };

        var data =[
            { label: tx1, data: [ ] }
        ];
        var begin1 = zeroStart ? dat1[0] : 0;
        var begin2 = zeroStart ? dat2[0] : 0;

        var dataEnd = skipLast > dat1.length ? dat1.length : skipLast;
        for(var i=0; i<(dataEnd-skipFirst); i++){
            data[0].data[i] = [(i+skipFirst)*0.025, dat1[(i+skipFirst)] - begin1 - (dat2[(i+skipFirst)] - begin2)];
        }
        $.plot(graph, data, options);
    };

    var MyPlot2Axis = function(tx1, dat1, tx2, dat2){
        graph.width(800).height(300);
        graph2.width(800).height(300);
        var options = {
            series: {
                lines: { show: true },
                points: { show: drawDots }
            }
        };

        var data =[
            { label: tx1, data: [ ] }
        ];
        var data2 =[
            { label: tx2, data: [ ] }
        ];
        var begin1 = zeroStart ? dat1[0] : 0;
        var begin2 = zeroStart ? dat2[0] : 0;

        var dataEnd = skipLast > dat1.length ? dat1.length : skipLast;
        for(var i=0; i<(dataEnd-skipFirst); i++){
            data[0].data[i] = [(i+skipFirst)*0.025, dat1[i+skipFirst] - begin1];
            data2[0].data[i] = [(i+skipFirst)*0.025, dat2[i+skipFirst] - begin2];
        }
        $.plot(graph, data, options);
        $.plot(graph2, data2, options);
    };



    var PlotPos = function(){
        MyPlot2("Позиция", curData, "Генератор", curTraj);
        cbPing();
    };


    var currentPlot = PlotPos;


    var PlotSpeedDiff = function() {
        MyPlot4(
            "Скорость", curSpeed,
            "Генератор", curSpeedT,
            "ОСкор", oldSpeed,
            "ОГен",  oldSpeedT
        );
        cbPing();
    };

    var PlotSpeed = function(){
        MyPlot2("Скорость", curSpeed, "Генератор", curSpeedT);
        cbPing();
    };


    var PlotAccel = function(){
        MyPlot2("Ускорение", curAccel, "Генератор", curAccelT);
        cbPing();
    };

    var PlotErrPos = function(){
        MyPlotDiff("Ошибка",curTraj , curData);
        cbPing();
    };

    var PlotUst = function(){
        MyPlot1("Уставка", curUst);
        cbPing();
    };

    // ADD BUTTON
    var addButton = function(ul, text,cb){
        var li = $('<li>');
        var btn = $('<button>').text(text).appendTo(li).on('click', cb);
        li.appendTo(ul);
        return btn;
    };

    var radioPos = function(){
        currentPlot = PlotPos;
        currentPlot();
    };

    var radioSpeed = function(){
        // append goes here
        currentPlot = PlotSpeed;
        currentPlot();
    };

    var radioAccel = function(){
        currentPlot = PlotAccel;
        currentPlot();
    };


    var addRadio = function(text, group, cb){
        var li = $('<li>');
        var btn = $('<input>').attr('type','radio').attr("name",group).appendTo(li).on('click',
            function() {
                if($(this).val() == 'on'){
                    cb();
                }
            });
        li.append(text);
        li.appendTo(ul);
        return btn;
    };

    var allBtn = addButton(ul, 'ВСЁ', DoAll);

    var goBtn = addButton(ul, 'ECS', DriveGO);
    var ftpBtn = addButton(ul, 'FTPGet', GetFTP);
    var plotBtn = addButton(ul, 'Plot', PlotGraph);

    addRadio('Поз', 'group1', radioPos);
    addRadio('Ск', 'group1', radioSpeed);
    addRadio('Уск', 'group1', radioAccel);

    addButton(ul, 'Ошибка', PlotErrPos);
    addButton(ul, 'Упр', PlotUst);

    addButton(ul, 'Разн', PlotSpeedDiff);

    addButton(ul, 'Повтор', function() {
        MyPlotDiff("ГенТек-Пред", curData,oldData);
        cbPing();
    });

    addButton(ul, 'УпрСк', function() {
        MyPlot2Axis("Упр", curUst, "Скор", curSpeed);
    });

    addButton(ul, 'УпрПол', function() {
        MyPlot2Axis("Упр", curUst, "Пол", curData);
    });

    var inp1 = $('<input>');


    addButton(ul2, 'Установка Позиции в', function(){
        var pos =  Math.round(parseFloat(inp1.val())*1000.0);
        eventBus.send('ecs.position',{
            DriveGroup:DriveGroup,
            position: pos
        }, function(res){
            console.log('GOT RESPAWN!');
        });
        return false;
    } );
    inp1.attr('name', "UstPos").attr('value',5).addClass('edit').appendTo(ul2);
    $('<li>').text('метров').appendTo(ul2);



    ul.appendTo(pp);
    ul2.appendTo(pp);
    var div = $('<div>');
    div.appendTo(pp);
    new showEditPParams(div);
    graph.appendTo(pp);
    graph2.appendTo(pp);
    meanOne.appendTo(pp);
    meanTwo.appendTo(pp);
}