from django.db import models


class Tag(models.Model):
    tag = models.CharField(max_length=30)

    def __unicode__(self):
        return self.tag

class FeedSource(models.Model):

    url = models.URLField(max_length=200)
    tags = models.ManyToManyField(Tag)

    def __unicode__(self):
        return self.url
        
