from django.conf import settings

if getattr(settings, 'ENABLE_HAYSTACK_SEARCH'):
    from askbot.search.haystack import UserIndex, ThreadIndex, PostIndex
