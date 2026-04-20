from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    event_typeS= [
        ('Exam', 'Exam'),
        ('Assignment', 'Assignment'),
        ('Holiday', 'HOLIDAY'),
        ('Event', 'Event'),
        ('Sports', 'SPORTS'),
    ]
    user = models
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    event_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Assignments(models.Model):
    event_typeS= [
        ('pending', 'pending'),
        ('completed', 'completed'),
        ('upcoming','upcoming')    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    event_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



# Create your models here.
