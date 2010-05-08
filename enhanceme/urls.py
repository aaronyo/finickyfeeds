from django.conf.urls.defaults import *

# The next two lines enable the admin site:
from django.contrib import admin
admin.autodiscover()

import enhanceme.feeds.urls

urlpatterns = \
    patterns('',
             # Standard django login/logout view handlers
             (r'^enhanceme/login/',
              'django.contrib.auth.views.login',
              {'template_name': 'login.tmpl'}),
             (r'^enhanceme/logout/',
              'django.contrib.auth.views.logout',
              {'template_name': 'logout.tmpl'}),

             (r'^enhanceme/feeds/', include(enhanceme.feeds.urls)),

             # Standard django admin includes
             (r'^enhanceme/admin/doc/',
              include('django.contrib.admindocs.urls')),
             (r'^enhanceme/admin/', include(admin.site.urls)),

                       
)
