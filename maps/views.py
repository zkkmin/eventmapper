from rest_framework import viewsets
from .serializers import EventMapSerializer, LayerSerializer
from .models import EventMap, Layer


class EventMapViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows EventMaps to be viewed or edited.
    """
    queryset = EventMap.objects.all()
    serializer_class = EventMapSerializer



class LayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Layers to be viewed or edited.
    """
    # TODO: query by eventmap
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer