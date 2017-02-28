from django.conf.urls import url, include
from django.views.generic import TemplateView

from rest_framework import routers
from . import views 


router = routers.DefaultRouter()
router.register(r'eventmaps', views.EventMapViewSet)
# TODO: require eventmap parameter
router.register(r'layers', views.LayerViewSet) 


urlpatterns = [
        url(r'^$', TemplateView.as_view(template_name='maps/home.html')),
        url(r'^api/', include(router.urls))
    ]
