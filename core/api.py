import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import throttle_classes
from rest_framework.throttling import UserRateThrottle
from django.conf import settings
from django.core.cache import cache

class GitHubThrottle(UserRateThrottle):
    rate = '10/minute'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([GitHubThrottle])
def github_stats(request):
    username = request.GET.get('username', 'github')  

        # Check cache first
    cache_key = f"github_user_{username}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print(f"Returning cached data for {username}")
        return Response(cached_data)

    try:
        headers = {
            'Accept': 'application/vnd.github.v3+json',
        }
        
        # Add authorization header if token is provided
        if settings.GITHUB_API_TOKEN:
            headers['Authorization'] = f'token {settings.GITHUB_API_TOKEN}'
        
        response = requests.get(
            f'https://api.github.com/users/{username}',
            headers=headers,
            timeout=10
        )
        
        print(f"GitHub API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            response_data = {
                'username': data['login'],
                'avatar_url': data['avatar_url'],
                'followers': data['followers'],
                'following': data['following'],
                'public_repos': data['public_repos'],
                'public_gists': data['public_gists'],
                'html_url': data['html_url'],
                'bio': data['bio'] or 'No bio available',
            }

            # Cache the response for 5 minutes
            cache.set(cache_key, response_data, timeout=300)

            return Response(response_data)
        elif response.status_code == 403:
            return Response({'error': 'GitHub API rate limit exceeded. Try again later.'}, status=429)
        elif response.status_code == 404:
            return Response({'error': f'GitHub user "{username}" not found'}, status=404)
        else:
            return Response({'error': f'GitHub API error: {response.status_code}'}, status=response.status_code)
            
    except requests.RequestException as e:
        print(f"GitHub API request failed: {e}")
        return Response({'error': 'Failed to connect to GitHub API'}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weather_current(request):
    city = request.GET.get('city', 'London')
    bypass_cache = request.GET.get('refresh', False)
    
    # Check cache first
    cache_key = f"weather_{city.lower().replace(' ', '_')}"  # Handle spaces in city names

    # Bypass cache if refresh parameter is present
    if not bypass_cache:
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"Returning cached data for {city}: {cached_data['location']}")
            return Response(cached_data)
        else:
            print(f"No cache found for {city}, making API call")
        
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print(f"Returning cached weather data for {city}")
        return Response(cached_data)
    
    # Get API key from settings
    api_key = settings.OPENWEATHER_API_KEY
    
    if not api_key:
        return Response({
            'location': city,
            'temperature': 22,
            'condition': 'Sunny',
            'humidity': 65,
            'message': 'Weather API key not configured'
        }, status=200)
    
    try:
        # OpenWeatherMap API call
        response = requests.get(
            f'http://api.openweathermap.org/data/2.5/weather',
            params={
                'q': city,
                'appid': api_key,
                'units': 'metric',  # For Celsius
                'lang': 'en'
            },
            timeout=10
        )
        
        print(f"Weather API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            weather_data = {
                'location': f"{data['name']}, {data['sys']['country']}",
                'temperature': round(data['main']['temp']),
                'condition': data['weather'][0]['description'].title(),
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed'],
                'pressure': data['main']['pressure'],
                'icon': data['weather'][0]['icon'],
                'success': True
            }
            
            # Cache for 1 minute
            cache.set(cache_key, weather_data, timeout=60)
            
            return Response(weather_data)
            
        elif response.status_code == 401:
            return Response({
                'location': city,
                'temperature': 22,
                'condition': 'API Error',
                'humidity': 65,
                'message': 'Invalid weather API key'
            }, status=200)
            
        elif response.status_code == 404:
            return Response({
                'location': city,
                'temperature': 22,
                'condition': 'Not Found',
                'humidity': 65,
                'message': f'City "{city}" not found'
            }, status=200)
            
        else:
            return Response({
                'location': city,
                'temperature': 22,
                'condition': 'API Error',
                'humidity': 65,
                'message': f'Weather API error: {response.status_code}'
            }, status=200)
            
    except requests.RequestException as e:
        print(f"Weather API request failed: {e}")
        return Response({
            'location': city,
            'temperature': 22,
            'condition': 'Connection Error',
            'humidity': 65,
            'message': 'Failed to connect to weather service'
        }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def news_headlines(request):
    category = request.GET.get('category', 'general')
    country = request.GET.get('country', 'us')
    
    # Check cache first
    cache_key = f"news_{category}_{country}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print(f"Returning cached news data for {category}/{country}")
        return Response(cached_data)
    
    # Get API key from settings
    api_key = settings.NEWS_API_KEY
    
    if not api_key:
        return Response({
            'articles': [],
            'message': 'News API key not configured',
            'success': False
        }, status=200)
    
    try:
        # NewsAPI call
        response = requests.get(
            f'https://newsapi.org/v2/top-headlines',
            params={
                'category': category,
                'country': country,
                'apiKey': api_key,
                'pageSize': 5  # Limit to 5 articles
            },
            timeout=10
        )
        
        print(f"News API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            news_data = {
                'articles': data.get('articles', [])[:5],  # Limit to 5 articles
                'totalResults': data.get('totalResults', 0),
                'category': category,
                'country': country,
                'success': True
            }
            
            # Cache for 15 minutes (news updates frequently)
            cache.set(cache_key, news_data, timeout=900)
            
            return Response(news_data)
            
        elif response.status_code == 401:
            return Response({
                'articles': [],
                'message': 'Invalid News API key',
                'success': False
            }, status=200)
            
        else:
            return Response({
                'articles': [],
                'message': f'News API error: {response.status_code}',
                'success': False
            }, status=200)
            
    except requests.RequestException as e:
        print(f"News API request failed: {e}")
        return Response({
            'articles': [],
            'message': 'Failed to connect to news service',
            'success': False
        }, status=200)