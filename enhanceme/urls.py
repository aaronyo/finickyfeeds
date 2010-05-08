from django.conf.urls.defaults import *

# The next two lines enable the admin site:
from django.contrib import admin
admin.autodiscover()

import enhanceme.feeds.urls

urlpatterns = patterns('',
    # Example:
    (r'^enhanceme/feeds/', include('enhanceme.feeds.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^enhanceme/admin/', include(admin.site.urls)),
)
