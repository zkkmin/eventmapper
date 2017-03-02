from rest_framework import serializers

from . import models


class LayerSerializer(serializers.HyperlinkedModelSerializer):
   
    
    class Meta:
        model = models.Layer
        fields = ('name', 'building_level', 'json_data', 'eventmap', 'pk' )


class EventMapSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    # layers = serializers.PrimaryKeyRelatedField(many=True, queryset=models.Layer.objects.all())
    # layers = LayerSerializer(many=True, read_only=True)
    
    class Meta:
        model = models.EventMap
        fields = ('name', 'description', 'user', 'created', 'pk'  )

        

