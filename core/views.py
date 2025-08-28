from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Widget
from .serializers import WidgetSerializer, UserRegistrationSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def api_home(request):
    message = {"message": "Hello from Django REST Framework!", "status": "success"}
    return Response(message)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user account.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# New API View for Widgets
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def widget_list(request):
    """
    List all widgets for the current user, or create a new widget.
    """
    # Check if the user is authenticated
    if not request.user.is_authenticated:
        # If user is NOT logged in, return an empty list and a 401 Unauthorized error
        return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        # Get all widgets for the currently logged-in user
        widgets = Widget.objects.filter(user=request.user)
        # Serialize the data (convert to JSON)
        serializer = WidgetSerializer(widgets, many=True)
        # Return the serialized data
        return Response(serializer.data)

    elif request.method == 'POST':
        # Create a new widget from the data sent by the user (request.data)
        serializer = WidgetSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new widget, linking it to the current user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # If the data is invalid, return the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', 'PATCH'])  # Add PATCH to the allowed methods
@permission_classes([IsAuthenticated])
def widget_detail(request, widget_id):
    """
    Retrieve, update or delete a specific widget.
    """
    widget = get_object_or_404(Widget, id=widget_id, user=request.user)
    
    if request.method == 'DELETE':
        widget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    elif request.method == 'PATCH':
        # Only allow updating specific fields for security
        serializer = WidgetSerializer(widget, data=request.data, partial=True)  # partial=True allows partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)