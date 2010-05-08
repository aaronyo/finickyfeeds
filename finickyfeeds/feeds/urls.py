from django.conf.urls.defaults import *
import finickyfeeds.feeds.views
from finickyfeeds import feeds

urlpatterns = patterns('',
    # Example:
    (r'^manage/', feeds.views.manage ),
    (r'^list/', feeds.views.list ),
)
