var __ACCORDION_READ_OPTIONS = { header: "h3",
                                 autoHeight: false,
                                 // Start without any feed displayed to
                                 // prevent unnecessary lookup of articles.
                                 collapsible: true,
                                 active: false};

var call__articles = function( subscription_id ) {
    var sub_id = subscription_id;

    var load_callback = function(resp, status, xhr) {
        if (status == "error") {
            //Want to make sure to get that stack trace for
            //debugging
            failure__generic( xhr, status, false );
        }
        else {
            //Upon success, nothing to do -- article html has already
            //been put in place by the jquery load function.
        }
    };

    ui__articles_element( sub_id ).load('articles',
                                        {'subscription_id':sub_id},
                                        load_callback );

};

var ui__clear_articles = function( subscription_id ) {
    ui__articles_element( subscription_id ).
        empty().
        append( __THROBBER_HTML );
}

var ui__articles_element = function( subscription_id ) {
    return $(".articles[id="+subscription_id+"]");
};


var handler__accordion_change = function( event, ui) {
    var new_id = $(ui.newContent).attr("id");
    var old_id = $(ui.oldContent).attr("id");

    // clean up the dom so we keep the page reasonably light
    if ( old_id != undefined ) {
        ui__clear_articles(old_id);
    }
    var articles_div =

    call__articles(new_id);
    return false;
};

$( function() {
    // Attach accordian widget
    $("#feeds-accordion").
           accordion(__ACCORDION_READ_OPTIONS).
           bind( "accordionchange", handler__accordion_change );
});

