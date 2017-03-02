from django.shortcuts import get_object_or_404

from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response

from .serializers import EventMapSerializer, LayerSerializer
from .permissions import IsOwnerOrReadOnly
from .models import EventMap, Layer


class MapLayersView(LoginRequiredMixin, TemplateView):
    """
    This view checks whether the map id belongs to 
    current user.
    """
    template_name = 'maps/layers.html'
    
    def dispatch(self, request, *args, **kwargs):
        map_pk = kwargs.get('map_pk', None)
        print request.user
        obj = get_object_or_404(EventMap, pk=map_pk, user=request.user)

        return super(MapLayersView, self).dispatch(request, *args, **kwargs)
    


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
        
    @detail_route(permission_classes=[permissions.IsAuthenticated],
                url_name='mlayers')
    def mlayers(self, request, pk=None):
        layers = Layer.objects.filter(eventmap__pk=pk)
        
        page = self.paginate_queryset(layers)
        
        if page is not None:
            serializer = LayerSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = LayerSerializer(layers, many=True, context={'request': request})
        return Response(serializer.data)



class LayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Layers to be viewed or edited.
    """
    # TODO: query by eventmap
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer


