from django.contrib.auth.models import User
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib import messages



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



def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Login Successful!") 
            return redirect('dashboard')  # must exist

        else:
            messages.error(request, "Invalid credentials")
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


def dashboard(request):
    return render(request, 'index.html')



def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        User.objects.create_user(username=username, password=password)
        messages.success(request, "Signup Successful! Please log in.")

        return redirect('login')

    return render(request, 'signup.html')








# Create your views here.
