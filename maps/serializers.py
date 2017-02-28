from rest_framework import serializers
from . import models


class EventMapSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = models.EventMap
        fields = ('name', 'description', 'user', 'created', )
        

class LayerSerializer(serializers.HyperlinkedModelSerializer):
    
    class Meta:
        model = models.Layer
        fields = ('name', 'building_level', 'json_data', 'eventmap', )