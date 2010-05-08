from django.conf.urls.defaults import *
import enhanceme.feeds.views
from enhanceme import feeds

urlpatterns = patterns('',
    # Example:
    (r'^manage/', feeds.views.manage ),
    (r'^list/', feeds.views.list ),
)
