from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView

from rest_framework import routers
from . import views 


router = routers.DefaultRouter()
router.register(r'eventmaps', views.EventMapViewSet)
router.register(r'layers', views.LayerViewSet)


urlpatterns = [
        url(r'^$', TemplateView.as_view(template_name='maps/home.html')),
        url(r'^maps/(?P<map_pk>[0-9]+)/layers/', views.MapLayersView.as_view()),
        url(r'^api/', include(router.urls)),
        
    ]
