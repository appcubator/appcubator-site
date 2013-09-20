from django.db import models

from django.contrib.auth.models import User
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType


class Document(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        abstract = False

class Love(models.Model):
    "A user or session owned indication of love for some object. Either user or session should be present to indicate the owner."
    content_type = models.ForeignKey(ContentType)
    object_pk = models.CharField(max_length=255)
    content_object = generic.GenericForeignKey(ct_field="content_type", fk_field="object_pk")
    user = models.ForeignKey(User, null=True, blank=True)
    session_key = models.CharField(max_length=255, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.content_object.__unicode__()

    class Meta:
        unique_together = ('content_type', 'object_pk', 'user', 'session_key')


class LovableManager(models.Manager):
    "Extends the standard model manager to include an order_by_love method."
    def order_by_love(self, desc=True):
        "Returns a queryset ordered by the love count on an object."
        qs = self.get_query_set()
        return generic_annotate(qs, Love.content_object, models.Count('id'))


class Lovable(models.Model):
    "Abstract model class that provides a convenience API for objects we know to be lovable. The lovable mixin is *not* required for adding love to objects, it just provides shortcuts."

    love = generic.GenericRelation(Love, content_type_field='content_type', object_id_field='object_pk')
    objects = LovableManager()

    class Meta:
        abstract = True
