from django.conf.urls import url, include
from rest_framework import routers
from . import views 


router = routers.DefaultRouter()
router.register(r'eventmaps', views.EventMapViewSet)
# TODO: require eventmap parameter
router.register(r'layers', views.LayerViewSet) 


urlpatterns = [
        url(r'^', include(router.urls))
    ]
