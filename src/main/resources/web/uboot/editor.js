function UbTestEditor(ubTest, eventBus) {
    this.ubTest = ubTest;
    this.eventBus = eventBus;
    // TODO: Сдлелать пометку на OnChange
    var ta = $('<textarea>').attr('cols',60).attr('rows', 20).text(ubTest.test);
    // TODO: Запретить редактиование
    var ta2 = $('<textarea>').attr('cols',60).attr('rows', 20).text('Лог');

    var inp = $('<select>');
    eventBus.send('ubtests.getports',{}, function(resp){
        console.log('GET PORTS');
        inp.empty();
        for(var k=0; k< resp.ports.length; k++){
            console.log(resp.ports[k]);
            inp.append('<option value="' + resp.ports[k] + '"> ' + resp.ports[k] + '</option>' )
        }
    });

    var runTest = function(){
        console.log('Run Test');
        ubTest.test = ta.val();
        // TODO: Добавить автоматический скан портов
        ubTest.port = inp.val();
        ta2.text('ВЫПОЛНЯЕТСЯ ТЕСТ.....');
        eb.send('ubtests.run', ubTest, function(res){
            console.log(res.status);
            if(res.status === 'ok'){
                ta2.text(res.response);
            } else {
                ta2.text('ERROR: \n' + res.response);
            }
        });
    };
    var saveTest = function(){
        var text = ta.val();
//        console.log('Try to save '+ text);
        ubTest.test = text;
        eb.send('ubtests.save', ubTest);
        // TODO: Сказать что он сохранен
    };

    $('.editor').empty();
    $('<h1>').text('Редактирование теста: ' + ubTest.name).appendTo('.editor');
    inp.appendTo('.editor');
    $('<button>').on('click', runTest).text('Пробный Запуск').appendTo('.editor');
    $('<button>').on('click', saveTest).text('Сохранить').appendTo('.editor');
    $('<br/>').appendTo('.editor');
    ta.appendTo('.editor');
    ta2.appendTo('.editor');
    var ul = $('<ul>');
    $('<li>').text('mw.b 0xaddr 0xval -  запись байта').appendTo(ul);
    $('<li>').text('mw 0xaddr 0xval: запись двойного слова').appendTo(ul);
    $('<li>').text('md.b 0xaddr 0xcount - дамп памяти побайтно').appendTo(ul);
    $('<li>').text('md 0xaddr 0xcount - дамп памяти по двойным словам').appendTo(ul);
    $('<li>').text('finish: окончание теста').appendTo(ul);
    ul.appendTo('.editor');
    //alert("Editor constructed");
}