from django.urls import path
from . import views
from .api import github_stats, weather_current, news_headlines

urlpatterns = [
    path('', views.api_home, name='api-home'),
    path('widgets/', views.widget_list, name='widget-list'),
    path('widgets/<int:widget_id>/', views.widget_detail, name='widget-detail'),
    path('github/stats/', github_stats, name='github-stats'),
    path('weather/current/', weather_current, name='weather-current'),
    path('news/headlines/', news_headlines, name='news-headlines'),
    path('auth/register/', views.register_user, name='user-register'),
]