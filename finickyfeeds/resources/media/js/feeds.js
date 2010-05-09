__ACCORDION_OPTIONS = { header: "h3", autoHeight: false };

var success__subscribe = function(data, status, req) {
    alert( data );
    var response = eval("(" + req.responseText + ")");
    if (response.result === "success") {
        var subscription = response.subscription;
        ui__add_subscription( subscription.sub_id,
                              subscription.feed.title,
                              subscription.feed.url,
                              subscription.tags );
    }
    else {
        alert( response.message );
    }
};

// ajax_error is for http error codes or other systemic
// errors, not for expected errors like user input that
// doesn't validate
var failure__generic = function(req, status, error) {
    // popup a window with the body of the error.
    // highly useful for displaying Django stack traces
    error_win = window.open('', 'error_win');
    error_win.document.write(req.responseText);
};

var call__subscribe = function(feed_url, tags_str) {
    var tags = tags_str.split(",");
    if ( feed_url !== "" ) {
        var params = { feed_url: feed_url, tags: tags };
    $.ajax({ type:"POST",
             url: "subscribe",
             data: params,
             data_type: "json",
             success: success__subscribe,
             error: failure__generic });
    }
};

// sub_id: the subscription's id which is embedded so that later evenrs
//         can reference the correct subscription
// feed_title: the title of the feed
// feed_url: the feed's url
// tags: an array of tags associated with the feed
var ui__add_subscription = function( subscription_id,
                                     feed_title,
                                     feed_url,
                                     tags ) {
    var sub_id = subscription_id;  // shorter name easier on the code layout...
    var tags_str = tags.join(', ');
    var accordion_entry =
               "<div> " +
               "   <h3><a href='#'>" + feed_title + "</a></h3> " +
               "     <div> " +
               "       <form> " +
               "         <table> <tr> " +
               "             <td> <label for='name'>URL:</label> </td>" +
               "             <td> " + feed_url + " </td> " +
               "           </tr> <tr> " +
               "             <td> <label for=\'tags'>Tags:</label> </td> " +
               "             <td> <input type='text' name='tags' " +
               "                         id='tags" + sub_id + "' " +
               "                         class='text ui-widget-content " +
               "                                ui-corner-all' " +
               "                         size=80 " +
               "                         value= '" + tags_str +"' /> </td> " +
               "           </tr> </table> " +
               "           <button class='update' " +
               "                   id='" + sub_id + "'> Update </button> " +
	       "      </form> " +
               "    </div> " +
	       "  </div> ";

    // You must destroy an accordion before redrawing it
    $("#feeds-accordion").
        append( accordion_entry).
        accordion('destroy').
        accordion(__ACCORDION_OPTIONS);
};

$( function() {
    // Attach accordian widget js
    $("#feeds-accordion").accordion(__ACCORDION_OPTIONS);

    // Attach button widget js
    $("button").button();

    $("button.subscribe").click( function() {
        // we'll put the value scraping here and the subscribe function
        // will do the actually work
        var url = $("#url_new").val();
        var tags = $("#tags_new").val();
        call__subscribe( url, tags );
        return false;
    });
});

