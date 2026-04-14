from django.shortcuts import render

from django.shortcuts import render

from django.http import JsonResponse
from .models import Event
from django.views.decorators.csrf import csrf_exempt
import json

def get_events(request):
    events = Event.objects.all()
    data = list(events.values())
    return JsonResponse(data, safe=False)


@csrf_exempt
def add_event(request):
    if request.method == "POST":
        data = json.loads(request.body)

        Event.objects.create(
            title=data.get("title"),
            date=data.get("date"),
            event_type=data.get("event_type")
        )

        return JsonResponse({"message": "Event added"})
    
    return JsonResponse({"error": "Invalid request"})




def home(request):
    return render(request, 'index.html')

# Create your views here.
