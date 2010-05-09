from finickyfeeds import settings

from django.conf.urls.defaults import *

# The next two lines enable the admin site:
from django.contrib import admin
admin.autodiscover()

import finickyfeeds.feeds.urls

urlpatterns = \
    patterns('',
             # For serving static resources
             (r'^static/(?P<path>.*)$', 'django.views.static.serve',
              {'document_root': settings.STATIC_MEDIA_PATH }),

             # Default to the list view, which requires login so you'll
             # bounce there if not logged in
             (r'finickyfeeds/$', 'finickyfeeds.feeds.views.list'),

             # Standard django login/logout view handlers
             (r'^finickyfeeds/login/',
              'django.contrib.auth.views.login',
              {'template_name': 'login.tmpl'}),
             (r'^finickyfeeds/logout/',
              'django.contrib.auth.views.logout',
              {'template_name': 'logout.tmpl'}),

             (r'^finickyfeeds/feeds/', include(finickyfeeds.feeds.urls)),

             # Standard django admin includes
             (r'^finickyfeeds/admin/doc/',
              include('django.contrib.admindocs.urls')),
             (r'^finickyfeeds/admin/', include(admin.site.urls)),

)
