from django.template import loader, RequestContext
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django import forms
from django.core import serializers

import json

from finickyfeeds.feeds.models import Feed, Subscription, Tag
from finickyfeeds.feeds import services


###################
# Private Helpers #
###################

def _failure_json( msg ):
    """ Produce a json string appropriate as an ajax failure response """

    response_dct = { 'result' : 'failure',
                      'message' : msg }
    return json.dumps(response_dct)


def _success_json( payload_name=None, payload_val=None ):

    """
    Produce a json string appropriate as an ajax success response 

    Payload is used as the key/value for what is returned in addition
    to the "success" status.

    """
    response_dct = { 'result': 'success' }
    if payload_name != None:
        response_dct[payload_name] = payload_val
    return json.dumps(response_dct)


def _subscription_json( subscription ):
    """ Create a success response containing details about a subscription. """
    sub = subscription
    # Django's built in serializers don't handle relationship traversal.
    # So, this is a straightforward way to make a json response that
    # suits my immediate needs (very coupled to my currunt views)
    sub_dct = { 'sub_id': sub.id,
                'feed': { 'url': sub.feed.url, 'title': sub.feed.title },
                'tags': [t.tag for t in sub.tags.all()] }
    return _success_json('subscription', sub_dct)


def _json_http_response( body ):
    """ Wrap up a json string in an HttpResponse with content_type set """
    return HttpResponse( body,
                         content_type = 'application/javascript')


######################################################################
# Page Requests.                                                     #
#                                                                    #
# Requests that are made/handled by the browser itself for rendering #
# of a complete page                                                 #
######################################################################

@login_required
def manage( request ):
    """ Produce the page for managing your subscriptions """

    subs = Subscription.objects.filter(subscriber=request.user)
    tmpl = loader.get_template('feeds/manage.tmpl')
    ctx = RequestContext(request, { 'subscriptions': subs })
    return HttpResponse(tmpl.render(ctx))


@login_required
def read( request ):
    """ Produce the page for reading articles from your subscriptions """

    subs = Subscription.objects.filter(subscriber=request.user)
    tag_counts = {}
    for sub in subs:
        for tag in sub.tags.all():
            if tag.tag in tag_counts:
                tag_counts[tag.tag] += 1
            else:
                tag_counts[tag.tag] = 1;
    filter_tag = request.GET.get('tag')
    if filter_tag != None:
        subs = subs.filter( tags=Tag.objects.filter(tag=filter_tag)[0] )
    tag_counts = tag_counts.items()
    tag_counts.sort()
    tmpl = loader.get_template('feeds/read.tmpl')
    ctx = RequestContext(request, { 'subscriptions': subs,
                                    'tag_counts': tag_counts,
                                    'filter_tag': filter_tag })
    return HttpResponse(tmpl.render(ctx))


@login_required
def list( request ):

    """
    Lists all feeds that are saved.  This page is on longer linked to.

    Leaving this for debuging.  To get to this page you must manually type
    in the URL."""

    sources = Feed.objects.all()
    tmpl = loader.get_template('feeds/list.tmpl')
    ctx = RequestContext(request, { 'feed_sources': sources })
    return HttpResponse(tmpl.render(ctx))


######################################################################
# Ajax Requests                                                      #
#                                                                    #
# Requests that are made/handled by java script embedded in a page   #
######################################################################

@login_required
def unsubscribe(request):
    """ Remove a subsctiption.  Returns the removed subscription id. """

    # FIXME: should implement real logging at some point
    print request.POST

    sub_id = request.POST.get('subscription_id')
    sub = Subscription.objects.filter(id=sub_id)[0]
    # FIXME: handle case where subscription isn't found... (e.g., when a stale
    #        browser window is open) hard failure fine for now
    sub.delete()
    return _json_http_response( _success_json('subscription_id', sub_id) )


@login_required
def update_subscription(request):
    """ Update a subsctiption.  For now, only the tag set can be updated. """

    # FIXME: should implement real logging at some point
    print request.POST

    sub_id = request.POST.get('subscription_id')
    tag_vals = request.POST.getlist('tags[]')

    sub = Subscription.objects.filter(id=sub_id)[0]
    sub.tags.clear()
    tags = Tag.get_or_create(tag_vals)
    sub.tags.add(*tags)

    sub.save()

    # The tags got trimmed and dupes removed -- see Tag.get_or_create()
    result_tag_vals = [t.tag for t in tags]
    # Pass back the subscription_id, too, as a convenience for updating
    # the displayed tags
    print "result_tags: "
    print result_tag_vals
    resp_content = { 'subscription_id': sub_id,
                     'tags': result_tag_vals }
    return _json_http_response( _success_json('content', resp_content) )


@login_required
def subscribe(request):

    """
    Add a subscription, and specify tags to go with the subscription.

    If a feed can not be found at the given URL, or you already subscribe
    to the given URL, a failure with an appropriate message is returned.

    Upon success, the json response contains details about the subsctipion
    for updating the UI.
    """

    # FIXME: should implement real logging at some point
    print request.POST

    feed_url = request.POST.get('feed_url')
    tag_vals = request.POST.getlist('tags[]')
    
    feed = services.feed_for_url(feed_url)
    if feed == None:
        print "a"
        resp_body = _failure_json(
            'A feed could not be found for the supplied url.' );
    else:
        # Check if the user is already subscribed
        subs = Subscription.objects.filter(subscriber=request.user,
                                           feed=feed)
        if subs.count() > 0:
            resp_body = _failure_json(
                'You already have a subscription for the supplied url.' );
        else:
            if not feed.pk:
                # then it's a new feed
                feed.save()
            new_sub = Subscription(feed=feed, subscriber=request.user)
            new_sub.save()

            tags = Tag.get_or_create(tag_vals)

            new_sub.tags.add(*tags)
            new_sub.save()

            resp_body = _subscription_json(new_sub)

    return _json_http_response(resp_body)


@login_required
def articles(request):

    """
    Return an HTML rendering of article summaries for a subscription.

    Presently hardcoded to only return the first 5 articles.

    """    
    # FIXME -- should implement real logging at some point
    print request.POST

    sub_id = request.POST.get('subscription_id')
    #FIXME: handle case where subscription isn't found...
    sub = Subscription.objects.filter(id=sub_id)[0]

    # Hard coded to only return the first 5 articles
    articles_lst = services.articles_for_url( sub.feed.url );
    tmpl = loader.get_template('feeds/articles.tmpl')
    ctx = RequestContext(request, { 'subscription_id': sub_id,
                                    'articles': articles_lst })
    return HttpResponse(tmpl.render(ctx))

