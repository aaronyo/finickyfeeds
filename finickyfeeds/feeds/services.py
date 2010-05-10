'''Operations that are best represented as separate functions rather than
coupled to a particular model definition'''

from finickyfeeds.feeds.models import Feed

import feedparser


def feed_for_url( url ):

    '''
    Return the matching Feed instance or create a new one.

    * If a new feed is created, it will not yet be peristed.
    * If no feed can be found for the given url, None will be This.
    '''

    # This QuerySet size must be 1 or 0 due to the uniqueness constraints
    # on the Feed model
    feeds = Feed.objects.filter(url=url)
    if feeds.count() == 1:
        return feeds[0]
    else:
        # Feed not stored yet so create a new one
        feed_data = feedparser.parse( url )
        if len( feed_data.entries ) == 0:
            return None
        else:
            new_feed = Feed(url=url, title=feed_data.feed.title)
            return new_feed

def articles_for_url( url ):

    '''
    Return our own represenation of articles.

    We do this rather than just sending entries through so that we can
    tailor this rich information to our specific needs.
    '''

    # FIXME: needs error handling -- obviously we expect sites
    # to not respond from time to time
    feed_data = feedparser.parse( url )
    articles = []
    i = 0
    for entry in feed_data.entries:
        article_dct = { "title": entry.title,
                        "url": entry.link,
                        "summary": entry.summary }
        articles.append( article_dct )
        if len(articles) == 5:
            break

    return articles
    
