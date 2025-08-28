import json
from django.db import models
from django.contrib.auth.models import User

class Widget(models.Model):
    WIDGET_TYPES = [
        ('github', 'GitHub Stats'),
        ('weather', 'Local Weather'),
        ('news', 'Top News'),
        ('todo', 'Personal Todo List'),
    ]

    # Link each widget to a specific user
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The type of widget (e.g., 'github', 'weather')
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES)
    # A JSON field to store any configuration for the widget (e.g., city for weather, username for GitHub)
    # We use a TextField for simplicity; in advanced setups, you'd use a JSONField.
    config = models.TextField(blank=True, default='{}')
    # The order in which the widget should appear on the dashboard
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s {self.widget_type} widget"

    class Meta:
        # Ensure a user doesn't have duplicate widgets of the same type
        unique_together = ['user', 'widget_type']
        # Order widgets by their 'order' value by default
        ordering = ['order']
    
    def save(self, *args, **kwargs):
        # Ensure config is valid JSON
        if self.config:
            try:
                json.loads(self.config)
            except json.JSONDecodeError:
                raise ValueError("Config must be valid JSON")
        super().save(*args, **kwargs)
    
    def get_config(self):
        """Return config as a Python dictionary"""
        if self.config:
            return json.loads(self.config)
        return {}
    
    def set_config(self, config_dict):
        """Set config from a Python dictionary"""
        self.config = json.dumps(config_dict)