$(document).ready(function() {

    var success = $('#submit-success');

    var boards = {};

    function getNameOfBoard(myArray, searchTerm){
          for(var i = 0, len = myArray.length; i < len; i++){
            if(myArray[i].id === searchTerm) return myArray[i].name;
          }
          return -1;
      }

    // Get all boards from Trello
    var getAllBoards = $.get( '/getBoards', function( data ) {
        boards = data;
        for(i = 0; i < boards.length; i++) {
            $('#myBoards').append('<option value="'+boards[i].id+'">'+boards[i].name+'</option>');
            $('.mySoloBoards').append('<option value="'+boards[i].id+'">'+boards[i].name+'</option>');
        }
    }).done(function(){
        $('#loader').fadeOut('slow');
        $('body').removeClass('no-scroll');
        getAllWebHooks();
    });

    getAllBoards.fail(function(jqXHR, textStatus, errorThrown){
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert('NodeJS server not responding.... Please refresh the page (we should make a reconnect function)');
    });

    // Alert box on 'remove' click in Webhooks Modal box
    $('#modal-webhooks-rmv').click(function(e){
        // Add blue bg to remove btn's
        $('#yes').addClass('blue-bg');
        $('#no').addClass('blue-bg');

        // Show remove approval
        e.preventDefault();
        $('#approve-wrap').show();
    });


    // if yes
    $('#yes').click(function(e){
        e.preventDefault();

        var data = $('#webhooks-modal-form').serialize();
        var theURL = 'mongies/webhooks/removeOne';

        $.ajax({
            type: 'POST',
            url: theURL,
            // Remember to change this.
            data: data
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in deleting the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function(err) {
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Record deleted!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Remove blue bg from remove btn's
            $('#yes').removeClass('blue-bg');
            $('#no').removeClass('blue-bg');

            $('#fieldset-info').remove();
            // Update notifier list (on frontpage)
            $('#approve-wrap').hide();
            $('.webhooks').hide();
            $('body').removeClass('no-scroll');
        }).
        always(function(){
                getAllWebHooks();
        });
    });

    // if no
    $('#no').click(function(){
        $('#approve-wrap').hide();

        // Remove blue bg from remove btn's
        $(this).removeClass('blue-bg');
        $('#yes').removeClass('blue-bg');
    });

    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.webhooks').hide();
        $('body').removeClass('no-scroll');
    });

    //
    //
    // ******* Webhooks code starts ********
    //
    //

    // Add new record
    $('#web-submit').click(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url:'mongies/webhooks/post',
            data: $('#web-custom-frm').serialize()
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in creating a new record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
            $('#web-answer').html('<center><strong>'+err.responseText+'</strong></center>');
        }).
        done(function(err) {
            // Success Feedback
            $('#submit-succes').empty();
            $('#submit-success').append('<h3>Created new record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Reset form on submit
            $('#web-custom-frm')[0].reset();
        }).
        always(function(err){
            // get all webhooks
            getAllWebHooks();
        });
    });

    /* Webhooks API update */

    $("#modal-webhooks-submit").click(function(e){
        e.preventDefault();
        var data = $('#webhooks-modal-form').serialize();
        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url:'mongies/webhooks/updateOne',
            // Remember to change this.
            data: data
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in updating the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function(err) {
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Updated record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
        }).
        always(function(err){
            // get all webhooks
            getAllWebHooks();
        });
    });

    // Recreate WebHook
    $('#modal-webhooks-recreate').click(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url:'mongies/webhooks/post',
            data: $('#webhooks-modal-form').serialize()
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in creating a new record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
            $('#web-answer').html('<center><strong>'+err.responseText+'</strong></center>');
        }).
        done(function(err) {
            // Success Feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Created new record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
            $('.webhooks').hide();
            $('body').removeClass('no-scroll');
            // Reset form on submit
        }).
        always(function(){
            // Get all Webhooks
            getAllWebHooks();
        });
    });

    function stripHTML(dirtyString) {
        var container = document.createElement('div');
        container.innerHTML = dirtyString;
        return container.textContent || container.innerText;
    }

    // Get all records
    var getAllWebHooks = function(){

        $.get('mongies/webhooks/all', function( data ) {
                $( '.current_webhooks' ).remove();

                var doesNotExistClass = "";
                $.each(data, function(i, val){

                    if(val.active === false){
                        doesNotExistClass = "doesNotExistAtTrello";
                    } else {
                        doesNotExistClass = "doesExistAtTrello";
                    }

                    var textToInsert = '';
                    textToInsert += "<fieldset class='current_webhooks clearfix'>";
                    textToInsert += "<div class='" + doesNotExistClass + "'></div>";
                    textToInsert += "<input type='hidden' class='field-info-item webhook-id' name='id' value='"+ val._id +"' disabled>";
                    textToInsert += "<input type='text' class='field-info-item board-name' value='" + getNameOfBoard(boards, val.idModel) + "' disabled>";
                    textToInsert += "<input type='text' class='field-info-item webhook-last-updated' value='"+ val.updated_at.substr(0, 10) +"' disabled>";
                    textToInsert += "<div class='edit-web edit-this'><img class='img-swap' src='img/edit.svg' alt='edit' /></div></fieldset>";
                    $('#web-field-info').after(textToInsert);
                });
            }).done(function(){
                $('.board-name').each(function( index ) {
                });
        });
    }

    // Edit / Save fieldsets
    $( '#web-sub-frm' ).on( 'click', 'div.edit-this', function(e) {
        $('.webhooks').show();
        $('body').addClass('no-scroll');

        // Set currentId (from the pressed notifier)
        var currentId = $(this).parent('fieldset').find('.webhook-id').val();
        var boardId = '';
        // Empty the Edit->Modal->Board Selection

        // Get information about the notifier you want to edit
        $.get( 'mongies/webhooks/findOne/' + currentId, function( data ) {
        // Set the values for id + project name + email + board (we are still)
          $('#webhooks_id').val(data[0]._id);
          $('#modal-desc').val(data[0].description);
          $('#modal-url').val(data[0].callbackURL);
          $('.mySoloBoards').val(data[0].idModel);

          if(data[0].active === false){
            $('#modal-webhooks-submit').hide();
            $('#modal-webhooks-recreate').show();
          } else {
            $('#modal-webhooks-submit').show();
            $('#modal-webhooks-recreate').hide();
          }

        }, "json").done(function(data){
        });
    });
});