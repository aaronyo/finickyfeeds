from django.conf.urls.defaults import *
import finickyfeeds.feeds.views
from finickyfeeds import feeds

urlpatterns = patterns('',
    # Example:
    (r'^manage/subscribe', feeds.views.subscribe ),
    (r'^manage/unsubscribe', feeds.views.unsubscribe ),
    (r'^manage', feeds.views.manage ),
    (r'^list', feeds.views.list ),
    (r'^read/articles', feeds.views.articles ),
    (r'^read', feeds.views.read ),
)
