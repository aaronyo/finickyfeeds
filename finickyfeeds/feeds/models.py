from django.db import models
from django.contrib.auth.models import User

class Feed(models.Model):

    # Explicitly stating max lenghts as this is important information
    # and prefer not to hide as defaults
    url = models.URLField(max_length=200, unique=True)
    title = models.CharField(max_length=200,
                             help_text="The title of the rss feed as " +
                             "supplied by the feed -- not user editable")
    create_date = models.DateField(auto_now_add=True)

    def __unicode__(self):
        return self.url + ", " + self.title

class Tag(models.Model):
    tag = models.CharField(max_length=30, unique=True)
    create_date = models.DateField(auto_now_add=True)

    def __unicode__(self):
        return self.tag

class Subscription( models.Model ):
    tags = models.ManyToManyField(Tag)
    feed = models.ForeignKey(Feed)
    create_date = models.DateField(auto_now_add=True)
    subscriber = models.ForeignKey( User )

    def __unicode__(self):
        return self.subscriber.username + ", " + self.feed.__unicode__()

    class Meta:
        unique_together = ("subscriber", "feed")
