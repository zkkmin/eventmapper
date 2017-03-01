from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import list_route
from rest_framework.response import Response

from .serializers import EventMapSerializer, LayerSerializer
from .permissions import IsOwnerOrReadOnly
from .models import EventMap, Layer


class EventMapViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows EventMaps to be viewed or edited.
    ViewSet automatically provides `list`, `create`, `retrieve`, `update` and
    `destroy` actions.
    """
    queryset = EventMap.objects.all()
    serializer_class = EventMapSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, 
                          IsOwnerOrReadOnly)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    
    @list_route(permission_classes=[permissions.IsAuthenticated],
                url_name='mymaps')
    def mymaps(self, request):
        user = request.user
        eventmaps = EventMap.objects.filter(user=user)
        
        page = self.paginate_queryset(eventmaps)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(eventmaps, many=True)
        return Response(serializer.data)



# TODO: http://www.django-rest-framework.org/api-guide/filtering/
# A view with url filtering

class LayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Layers to be viewed or edited.
    """
    # TODO: query by eventmap
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer