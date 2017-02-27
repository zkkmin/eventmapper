from __future__ import unicode_literals

from django.db import models
from django.contrib.postgres.fields import JSONField
# Create your models here.


class EventMap(models.Model):
    name = models.CharField(max_length=1024)
    description = models.TextField()
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ('created',)


class Layer(models.Model):
    name = models.CharField(max_length=1024)
    building_level = models.CharField(max_length=3)
    json_data = JSONField()
    eventmap = models.ForeignKey('EventMap', on_delete=models.CASCADE)

