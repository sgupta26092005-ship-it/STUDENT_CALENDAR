from django.contrib.auth.models import User
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
from django.contrib import messages



from django.http import JsonResponse
from .models import Event
from django.views.decorators.csrf import csrf_exempt
import json

from django.db.models import Q
from django.contrib.auth.decorators import login_required

@login_required
def get_events(request):
    events = Event.objects.filter(
        Q(is_global=True) | Q(users=request.user)
    )

    data = list(events.values())
    return JsonResponse(data, safe=False)


from django.contrib.auth.decorators import login_required

@login_required   # 🔥 IMPORTANT
def add_event(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            if not data.get("title") or not data.get("date"):
                return JsonResponse({"error": "Missing title or date"}, status=400)

            event = Event.objects.create(
                title=data.get("title"),
                date=data.get("date"),
                event_type=data.get("event_type", "Event"),
                is_global=data.get("is_global", False)
            )

            # 🔥 ALWAYS attach logged-in user
            event.users.add(request.user)

            return JsonResponse({"message": "Event added"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


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


@login_required
def dashboard(request):
    events = Event.objects.filter(
        Q(is_global=True) | Q(users=request.user)
    ).order_by('date')

    return render(request, 'index.html', {'events': events})



def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        User.objects.create_user(username=username, password=password)
        messages.success(request, "Signup Successful! Please log in.")

        return redirect('login')

    return render(request, 'signup.html')








# Create your views here.
