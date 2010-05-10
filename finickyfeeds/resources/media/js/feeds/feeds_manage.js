/* See feeds_common.js for an overview of the naming conventions used */

var __ACCORDION_MANAGE_OPTIONS = { header: "h3",
                                 autoHeight: false,
                                 collapsible: true };

/////////////////////////////////

// AJAX Wrappers and Callbacks //

/////////////////////////////////

var success__subscribe = function(data, status, req) {
    ui__wait_anim_hide();
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

var success__update = function(data, status, req) {
    var response = eval("(" + req.responseText + ")");
    if (response.result === "success") {
        ui__set_tags_for_subscription( response.content.subscription_id,
                                       response.content.tags );
    }
    ui__wait_anim_hide();
};

var success__unsubscribe = function(data, status, req) {
    // Do nothing.  Use to display an alert here.
    // FIXME: remove this function.
};

var call__subscribe = function(feed_url, tags) {
    var params = { "feed_url": feed_url, "tags": tags };
    $.ajax({ type:"POST",
             url: "subscribe",
             data: params,
             data_type: "json",
             success: success__subscribe,
             error: failure__generic });
};

var call__update = function(subscription_id, tags) {
    $.ajax({ type:"POST",
             url: "updatesub",
             data: {"subscription_id": subscription_id, "tags": tags},
             data_type: "json",
             success: success__update,
             error: failure__generic });
};

var call__unsubscribe = function( subscription_id ) {
    $.ajax({ type:"POST",
             url: "unsubscribe",
             data: {"subscription_id": subscription_id},
             data_type: "json",
             success: success__unsubscribe,
             error: failure__generic });
};


//////////////////////

// DOM Manipulation //

//////////////////////


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
    // jQuery has a nice cloning feature...
    var collapsed = $.extend( {},
                              __ACCORDION_MANAGE_OPTIONS,
                              { active: false } );
    $(".subscription_entry[id="+sub_id+"]").remove();
    // redraw, fully collapsed (since we're removing the open entry
    $("#feeds-accordion").
        accordion("destroy").
        accordion(collapsed);
};

var ui__clear_new_subscription = function() {
    $("#url_new").val("");
    $("#tags_new").val("");
};

var ui__subscribe_wait_anim = function() {
    ui__button_wait_anim( $("button.subscribe") )
}

var ui__button_wait_anim = function( btn_selector ) {
    btn_selector.after( "<span>" +
                        //poor man's spacer
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                        __THROBBER_HTML + "</span>");
};

var ui__wait_anim_hide = function() {
    $(".wait-anim").remove();
};

var ui__tags_for_subscription = function( sub_id ) {
    return $("input[id=tags"+sub_id+"]").val().split(",");
};

var ui__set_tags_for_subscription = function( sub_id, tags ) {
    $("input[id=tags"+sub_id+"]").val( tags.join(", ") );
}


//////////////////////

// Event Handlers   //

//////////////////////

var handler__update_click = function() {
    var sub_id = $(this).attr("id");
    var tags = ui__tags_for_subscription( sub_id );
    ui__button_wait_anim( $(this) );
    call__update( sub_id, tags );
    return false;
};

var handler__unsub_click = function() {
    var sub_id = $(this).attr("id");
    call__unsubscribe( sub_id );
    ui__remove_subscription( sub_id );
    return false;
};

var handler__subscribe_click = function() {
    console.log("here");
    // we'll put the value scraping here and the subscribe function
    // will do the actually work
    var url = $("#url_new").val();
    if ( url !== "" ) {
        ui__subscribe_wait_anim();
        var tags = $("#tags_new").val().split(",");
        call__subscribe( url, tags );
    }
    return false;
};

$( function() {
    // Attach accordian widget
    $("#feeds-accordion").accordion(__ACCORDION_MANAGE_OPTIONS);

    // Attach button widget
    $("button").button();

    $("button.subscribe").click( handler__subscribe_click );

    $("button.unsubscribe").click( handler__unsub_click );

    $("button.update").click( handler__update_click );
});

