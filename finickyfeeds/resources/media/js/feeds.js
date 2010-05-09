var subscribe_done = function(data, status, req) {
    alert( data );
}

// ajax_error is for http error codes or other systemic
// errors, not for expected errors like user input that
// doesn't validate
var ajax_error = function(req, status, error) {
    // popup a window with the body of the error.
    // highly useful for displaying Django stack traces
    error_win = window.open('', 'error_win');
    error_win.document.write(req.responseText);
}

var subscribe = function(feed_url, tags_str) {
    var tags = tags_str.split(",");
    if ( feed_url !== "" ) {
        var params = { feed_url: feed_url, tags: tags };
    $.ajax({ type:"POST",
             url: "subscribe",
             data: params,
             data_type: "json",
             success: subscribe_done,
             error: ajax_error });
    }
}

$( function() {
    // Attach accordian widget js
    $("#feeds-accordion").accordion({ header: "h3",
                                      autoHeight: false });

    // Attach button widget js
    $("button").button();

    $("button.subscribe").click( function() {
        // we'll put the value scraping here and the subscribe function
        // will do the actually work
        var url = $("#url_new").val();
        var tags = $("#tags_new").val();
        subscribe( url, tags );
        return false;
    });
})
