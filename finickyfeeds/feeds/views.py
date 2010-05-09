from django.template import loader, RequestContext
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django import forms
from django.core import serializers

import json

from finickyfeeds.feeds.models import Feed, Subscription, Tag
from finickyfeeds.feeds import services

@login_required
def manage( request ):
    subs = Subscription.objects.filter(subscriber=request.user)
    tmpl = loader.get_template('feeds/manage.tmpl')
    ctx = RequestContext(request, { 'subscriptions': subs })
    return HttpResponse(tmpl.render(ctx))

def _failure_json_resp( msg ):
    response_dct = { 'result' : 'failure',
                      'message' : msg }
    return json.dumps( response_dct )

def _subscription_json_resp( subscription ):
    sub = subscription
    # Django's built in serializers don't handle relationship traversal.
    # So, this is a straightforward way to make a json response that
    # suits my immediate needs (very coupled to my currunt views)
    sub_dct = { 'feed': { 'url': sub.feed.url, 'title': sub.feed.title },
                'tags': [t.tag for t in sub.tags.all()] }
    response_dct = { 'result': 'success',
                     'subscription': sub_dct }
    return json.dumps( response_dct )

@login_required
def subscribe( request ):
    print request.POST
    feed_url = request.POST.get('feed_url')
    tag_vals = request.POST.getlist('tags[]')
    
    feed = services.feed_for_url(feed_url)
    if feed == None:
        print "a"
        resp_body = _failure_json_resp(
            "A feed could not be found for the supplied url." );
    else:
        # Check if the user is already subscribed
        subs = Subscription.objects.filter(subscriber=request.user,
                                           feed=feed)
        if subs.count() > 0:
            resp_body = _failure_json_resp(
                "You already have a subscription for the supplied url." );
        else:
            if not feed.pk:
                # then it's a new feed
                feed.save()
            tags = []
            for val in tag_vals:
                t_set = Tag.objects.filter(tag=val)
                if t_set.count() == 1:
                    t = t_set[0]
                else:
                    t = Tag(tag=val)
                    t.save()
                tags.append(t)
            new_sub = Subscription(feed=feed, subscriber=request.user)
            new_sub.save()
            new_sub.tags.add( *tags )
            new_sub.save()

            resp_body = _subscription_json_resp( new_sub )

    return HttpResponse( resp_body,
                         content_type = 'application/javascript; charset=utf8' )
    
        
              
#    json_serializer = serializers.get_serializer("json")()
#    json_serializer.serialize(queryset, ensure_ascii=False, stream=response)
    return HttpResponse()

@login_required
def list( request ):
    sources = Feed.objects.all()
    tmpl = loader.get_template('feeds/list.tmpl')
    ctx = RequestContext(request, { 'feed_sources': sources })
    return HttpResponse(tmpl.render(ctx))
