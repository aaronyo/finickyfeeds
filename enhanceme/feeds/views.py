from django.template import loader, Context
from django.http import HttpResponse

from enhanceme.feeds.models import FeedSource

def manage():
    pass

def list( request ):
    sources = FeedSource.objects.all()
    tmpl = loader.get_template('feeds/list.tmpl')
    ctx = Context({
            'feed_sources': sources
            })
    return HttpResponse(tmpl.render(ctx))
