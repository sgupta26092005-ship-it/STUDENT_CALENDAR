from django.db import models
from django.contrib.auth.models import User, Group


class Event(models.Model):
    EVENT_TYPES = [
        ('Exam', 'Exam'),
        ('Assignment', 'Assignment'),
        ('Holiday', 'Holiday'),
        ('Event', 'Event'),
        ('Sports', 'Sports'),
    ]

    users = models.ManyToManyField(User, blank=True)
    is_global = models.BooleanField(default=False)

    groups = models.ManyToManyField(Group, blank=True)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()

    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Assignment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('upcoming', 'Upcoming'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()

    groups = models.ManyToManyField(Group, blank=True)

    event_type = models.CharField(max_length=50, choices=STATUS_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title