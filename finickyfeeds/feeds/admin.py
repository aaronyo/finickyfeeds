from finickyfeeds.feeds.models import FeedSource, Tag
from django.contrib import admin

# FIXME: probably don't actually need admin interfaces for these...
# doing this now to play around with the admin
admin.site.register(FeedSource)
admin.site.register(Tag)
