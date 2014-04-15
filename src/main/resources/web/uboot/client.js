var eb = new vertx.EventBus(window.location.protocol + '//' +window.location.hostname + ':' +window.location.port + '/eventbus');
eb.onopen = function() {
    var renderListItem = function(test) {
        var li = $('<li>');
        var openUbTest = function() {
            new UbTestEditor(test, eb);
            return false;
        };

        var deleteUbTest = function() {
            eb.send('ubtests.delete', {id: test._id}, function() {
                li.remove();
            });
            return false;
        };

        $('<a>').text(test.name).attr('href','#').on('click', openUbTest).appendTo(li);
        $('<button>').text('Delete').on('click', deleteUbTest).appendTo(li);
        li.appendTo('.ub-tests');
    };

    $('.create-form').submit(function() {
        console.log('Test');
        var nameInput = $('[name=name]', this);
        eb.send('ubtests.save', {
            name: nameInput.val(),
            test: 'finish'
        }, function(result) {
            renderListItem(result);
            nameInput.val('');
        });
        return false;
    });
    eb.send('ubtests.list',{},
        function(res){
            $.each(res.ubtests,function() {renderListItem(this)} );
        }
    );
};
