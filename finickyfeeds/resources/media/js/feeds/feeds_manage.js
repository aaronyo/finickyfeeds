/*
 * Javascript used by the feeds pages.  I stopped short of using OO to
 * organize the code, but I used some convention (function prefixes) to make
 * the code easier to follow:
 *
 * Ajax:
 * call__* : a function that wraps an ajax call
 * success__* : a callback for a successful ajax response
 * failure__* : a callback for a failed ajax response
 *
 * Dom Manipluation:
 * ui__* : all changing of the dom is contained behind these functions
 *
 * Event processing:
 * handler__* : These functions are attached to events, such as click.
 *              The handler function should handled scraping any values
 *              needed out of the dom, and then delegating the actual
 *              work to a function that can be decoupled from the dom or
 *              make use of ui__* functions.
 *
 * FIXME: There is still some duplication between html in the template files and
 *        and html embedded in this js that should be removed.
 *
 */


var __ACCORDION_MANAGE_OPTIONS = { header: "h3", autoHeight: false };
var __ACCORDION_READ_OPTIONS = { header: "h3",
                                 autoHeight: false,
                                 // Start without any feed displayed to
                                 // prevent unnecessary lookup of articles.
                                 collapsible: true,
                                 active: false};

var success__subscribe = function(data, status, req) {
    var response = eval("(" + req.responseText + ")");
    if (response.result === "success") {
        var subscription = response.subscription;
        alert( "You have subscribed to: " + subscription.feed.title );
        ui__clear_new_subscription();
        ui__add_subscription( subscription.sub_id,
                              subscription.feed.title,
                              subscription.feed.url,
                              subscription.tags );
    }
    else {
        alert( response.message );
    }
};

var success__unsubscribe = function(data, status, req) {
    var response = eval("(" + req.responseText + ")");
    if (response.result === "success") {
        alert( "You have unsubscribed." );
        var sub_id = response.subscription_id;
        ui__remove_subscription( sub_id );
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

var call__unsubscribe = function( subscription_id ) {
    $.ajax({ type:"POST",
             url: "unsubscribe",
             data: {"subscription_id":subscription_id},
             data_type: "json",
             success: success__unsubscribe,
             error: failure__generic });
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
               "<div class='subscription_entry' id='" + sub_id + "'> " +
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
               "           <button class='unsubscribe' " +
               "                 id='" + sub_id + "'> Unsubscribe </button> " +
               "           <button class='update' " +
               "                   id='" + sub_id + "'> Update </button> " +
	       "      </form> " +
               "    </div> " +
	       "  </div> ";

    // You must destroy an accordion before updating it it
    $("#feeds-accordion").
        append( accordion_entry).
        accordion("destroy").
        accordion(__ACCORDION_MANAGE_OPTIONS);

    // Hookup the buttons
    $("button.update[id="+sub_id+"]").
        button().
        click( handler__update_click );
    $("button.unsubscribe[id="+sub_id+"]").
        button().
        click( handler__unsub_click );
};

var ui__remove_subscription = function( sub_id ) {
    console.log("sub_id: " + sub_id);
    $(".subscription_entry[id="+sub_id+"]").remove();
    // redraw, otherwise some cached information seems amiss...
    $("#feeds-accordion").
        accordion("destroy").
        accordion(__ACCORDION_MANAGE_OPTIONS);
};

var ui__clear_new_subscription = function() {
    $("#url_new").val("");
    $("#tags_new").val("");
};

var handler__update_click = function() {
}
var handler__unsub_click = function() {
    var sub_id = $(this).attr("id");
    call__unsubscribe( sub_id );
    return false;
};

$( function() {
    // Attach accordian widget
    $("#feeds-accordion").accordion(__ACCORDION_MANAGE_OPTIONS);

    // Attach button widget
    $("button").button();

    $("button.subscribe").click( function() {
        // we'll put the value scraping here and the subscribe function
        // will do the actually work
        var url = $("#url_new").val();
        var tags = $("#tags_new").val();
        call__subscribe( url, tags );
        return false;
    });

    $("button.unsubscribe").click( handler__unsub_click );
});

