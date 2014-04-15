delayTime = 5000;
L = 1000;
V = 200;
A = 200;
oneWay = true;
zeroStart = false;
powerOff = true;
drawDots = true;

skipLast =0;
skipFirst = 0;

begMean = 0;
endMean = 0;

meanOne = $('<p>');
meanTwo = $('<p>');


function showEditPParams(div){

    var ul = $('<ul>');
    var ul2 = $('<ul>');
    var ul3 = $('<ul>');

    var addLI = function(ul, text, iVal, cb){
        var li = $('<li>').text(text + " : ");
        var inp = $('<input>');
        inp.val(iVal).addClass('edit').on('change', function(){
            cb(parseFloat(inp.val()));
            return false;
        }).appendTo(li);
        li.appendTo(ul);
        return inp;
    };

    var addLIchkb = function(ul,text, iVal, cb){
        var li = $('<li>').text(text + " : ");
        var inp = $('<input>').attr('type', 'checkbox');
        if(iVal){
            inp.attr('checked', 'checked');
        }

        inp.addClass('edit').on('change', function(){
            var $this = $(this);
            // $this will contain a reference to the checkbox
            if ($this.is(':checked')) {
                // the checkbox was checked
                cb(true);
                //inp.removeAttr('checked');
            } else {
                // the checkbox was unchecked
                cb(false);
                //inp.attr('checked', 'checked');
            }
            return false;
        }).appendTo(li);
        li.appendTo(ul);
    };

    var dt = addLI('Time',delayTime/1000, function(val){ delayTime = val*1000; });

    var updateDt = function() {
        var newTime = Math.abs(L/V*1.7);
        dt.val(newTime);
        delayTime = newTime * 1000;
    };

    addLIchkb(ul,"OWay", oneWay, function(val){ oneWay = val});
    addLI(ul,'L',L/1000, function(val){ L = val*1000; updateDt();});
    addLI(ul,'V',V/1000, function(val){ V = val*1000; updateDt();});
    addLI(ul,'A',A/1000, function(val){ A = val*1000; updateDt();});
    addLI(ul2,'First',skipFirst*0.025,function(val){ skipFirst = Math.round(val/0.025)});
    addLI(ul2,'End',skipLast*0.025,function(val){ skipLast = Math.round(val/0.025)});
    addLIchkb(ul2,"Совм", zeroStart, function(val){ zeroStart = val});
    addLIchkb(ul2,"ВЫКЛ", powerOff, function(val){ powerOff = val});
    addLIchkb(ul2,"DOT", drawDots, function(val){
        drawDots = val;
    });

    addLI(ul3, "НачСр", begMean*0.025, function(val){ begMean = val/0.025});
    addLI(ul3, "КонСр", endMean*0.025, function(val){ endMean = val/0.025});

    ul.appendTo(div);
    ul2.appendTo(div);
    ul3.appendTo(div);
    updateDt();
}