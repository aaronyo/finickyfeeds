from django.db import models
from django.contrib.auth.models import User

class Feed(models.Model):
    url = models.URLField(max_length=200, unique=True)
    title = models.CharField(max_length=200,
                             help_text='The title of the rss feed as ' +
                             'supplied by the feed -- not user editable')
    create_date = models.DateField(auto_now_add=True)

    def __unicode__(self):
        return self.url + ', ' + self.title


class Tag(models.Model):
    tag = models.CharField(max_length=30, unique=True)
    create_date = models.DateField(auto_now_add=True)

    @staticmethod
    def get_or_create(tag_vals):
        """
        Convenience function for looking up or creating new tag records

        Uses a set, so duplicates will be reduced.

        """
        tags = set()
        for val in tag_vals:
            val = val.strip()
            if val == '':
                # Ignore blank tags
                continue 
            t_set = Tag.objects.filter(tag=val)
            if t_set.count() == 1:
                t = t_set[0]
            else:
                t = Tag(tag=val)
                t.save()
            tags.add(t)

        sorted_tags = list(tags)
        sorted_tags.sort()

        return sorted_tags

    def __unicode__(self):
        return self.tag

    class Meta:
        ordering = ['tag']


class Subscription(models.Model):
    tags = models.ManyToManyField(Tag)
    feed = models.ForeignKey(Feed)
    create_date = models.DateField(auto_now_add=True)
    subscriber = models.ForeignKey( User )

    def __unicode__(self):
        return self.subscriber.username + ', ' + self.feed.__unicode__()

    class Meta:
        unique_together = ('subscriber', 'feed')


