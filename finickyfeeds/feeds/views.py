from django.template import loader, RequestContext
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from finickyfeeds.feeds.models import FeedSource

def manage():
    pass

@login_required
def list( request ):
    print( "list" )
    sources = FeedSource.objects.all()
    tmpl = loader.get_template('feeds/list.tmpl')
    ctx = RequestContext( request,
                          { 'feed_sources': sources } )
    return HttpResponse(tmpl.render(ctx))
