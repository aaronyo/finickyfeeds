from finickyfeeds.feeds.models import Feed, Tag, Subscription
from django.contrib import admin

# FIXME: probably don't actually need admin interfaces for these...
# doing this now to play around with the admin
admin.site.register(Feed)
admin.site.register(Tag)
admin.site.register(Subscription)
