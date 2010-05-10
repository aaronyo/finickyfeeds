/*
 * Javascript used by the feeds pages.
 *
 * I stopped short of using OO to organize the code, but I used some
 * convention (function prefixes) across the javascript to make the code
 * easier to follow:
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

// ajax_error is for http error codes or other systemic
// errors, not for expected errors like user input that
// doesn't validate
var failure__generic = function(req, status, error) {
    // popup a window with the body of the error.
    // highly useful for displaying Django stack traces
    error_win = window.open('', 'error_win');
    error_win.document.write(req.responseText);
};

// I didn't coin this phrase -- it refers to a "processing..." graphic
var __THROBBER_HTML = "<img align='center' class='wait-anim'" +
                      "src='/static/image/ajax-loader.gif' />";
