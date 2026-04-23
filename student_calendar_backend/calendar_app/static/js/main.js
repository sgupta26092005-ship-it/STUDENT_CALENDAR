// Force light mode and disable all animations dynamically (Applied Globally)
// ==========================
// HELPER to get CSRF token for POST requests
// ==========================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

(function() {
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation: none !important;
            transition: none !important;
        }
        :root {
            color-scheme: light !important;
        }
    `;
    document.head.appendChild(style);
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.remove('dark', 'dark-mode', 'dark-theme');
        document.documentElement.classList.remove('dark', 'dark-mode', 'dark-theme');
    });
})();

// ============================================================================
// UTILITY FUNCTION: Date Formatting (Available globally for all modules)
// ============================================================================
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

// ============================================================================
// MODULE: College Calendar (formerly college-calendar.js)
// ============================================================================
(function() {
    let nav = 0; // This will be synced with college.js
    let clicked = null;
    let events = []; // Will be populated from the backend
    
    const calendar = document.getElementById('assignmentCalendar');
    const newAssignmentModal = document.getElementById('newAssignmentModal');
    const backDrop = document.getElementById('modalBackDrop');
    const eventTitleInput = document.getElementById('eventTitleInput');
    const eventDescInput = document.getElementById('eventDescInput');
    const eventTypeSelectModal = document.getElementById('eventTypeSelectModal');
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    function openModal(date) {
        clicked = date;
        const selectedDateLabel = document.getElementById('modalSelectedDate');
        if (selectedDateLabel) {
            selectedDateLabel.innerText = `Selected date: ${formatDateToDDMMYYYY(clicked)}`;
        }
        
        // Display existing events for the clicked day
        const eventsForDayDiv = document.getElementById('eventsForDay');
        if (eventsForDayDiv) {
            const eventsOnDay = events.filter(e => e.date === clicked);
            if (eventsOnDay.length > 0) {
                eventsForDayDiv.innerHTML = '';
                eventsOnDay.forEach(e => {
                    eventsForDayDiv.innerHTML += `<div style="padding: 8px; background: var(--bg-quaternary); margin-bottom: 8px; border-radius: 6px; border-left: 4px solid var(--primary-color); font-size: 0.9em;"><strong>${e.title}</strong> <span style="font-size: 0.85em; color: var(--text-muted); float: right; text-transform: capitalize;">${e.status}</span></div>`;
                });
            } else {
                eventsForDayDiv.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 15px;">No events for this day. Add one below!</p>';
            }
        }

        if (newAssignmentModal) newAssignmentModal.style.display = 'block';
        if (backDrop) backDrop.style.display = 'block';
    }
    
    function load() {
        const dt = new Date();
    
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav);
        }
    
        const day = dt.getDate();
        const month = dt.getMonth();
        const year = dt.getFullYear();
    
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
        const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
    
        calendar.innerHTML = '';
    
        // Render calendar headers
        weekdays.forEach(day => {
            const daySquare = document.createElement('div');
            daySquare.classList.add('calendar-header');
            if (day === 'Saturday' || day === 'Sunday') {
                daySquare.classList.add('weekend-header');
            }
            daySquare.innerText = day.substring(0, 3).toUpperCase();
            calendar.appendChild(daySquare);
        });
    
        for (let i = 1; i <= paddingDays + daysInMonth; i++) {
            const daySquare = document.createElement('div');
            daySquare.classList.add('calendar-day');
    
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;
    
            if (i > paddingDays) {
                daySquare.innerText = i - paddingDays;
    
                // Calculate weekday: 0=Monday, 5=Saturday, 6=Sunday
                const dayOfMonth = i - paddingDays;
                const weekdayIndex = (paddingDays + dayOfMonth - 1) % 7;
                if (weekdayIndex === 5 || weekdayIndex === 6) {
                    daySquare.classList.add('weekend');
                }
    
                const eventsForDay = events.filter(e => e.date === dayString);
    
                if (i - paddingDays === day && nav === 0) {
                    daySquare.id = 'currentDay';
                }
    
                if (eventsForDay.length > 0) {
                    eventsForDay.forEach(event => {
                        // Determine status for color-coding. If event.completed is true, status is 'completed'.
                        const eventStatus = event.completed ? 'completed' : (event.status || 'pending');
                        const eventDiv = document.createElement('div');
                        eventDiv.classList.add('calendar-task');
                        eventDiv.classList.add(eventStatus);
                        eventDiv.innerText = event.title;
                        // Color is applied via CSS class
                        daySquare.appendChild(eventDiv);
                    });
                }
    
                daySquare.addEventListener('click', () => openModal(dayString));
            } else {
                daySquare.classList.add('padding');
            }
    
            calendar.appendChild(daySquare);
        }
    }
    
    function closeModal() {
        if (eventTitleInput) eventTitleInput.classList.remove('error');
        if (newAssignmentModal) newAssignmentModal.style.display = 'none';
        if (backDrop) backDrop.style.display = 'none';
        if (eventTitleInput) eventTitleInput.value = '';
        if (eventDescInput) eventDescInput.value = '';
        if (eventTypeSelectModal) {
            eventTypeSelectModal.value = 'assignment';
        }
        clicked = null;
        load();
    }
    
    async function saveEvent(e) {
        if (e && e.preventDefault) e.preventDefault();

        if (!eventTitleInput) {
            alert('Cannot save: title input field is missing.');
            return;
        }

        if (!eventTitleInput.value.trim()) {
            eventTitleInput.classList.add('error');
            alert('Please enter a title for the event.');
            return;
        }

        eventTitleInput.classList.remove('error');
        const eventType = eventTypeSelectModal ? eventTypeSelectModal.value : 'Assignment';
        // Capitalize first letter to match Django model choices
        const formattedEventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);

        const eventData = {
            date: clicked, // Stored in YYYY-MM-DD format
            title: eventTitleInput.value,
            description: eventDescInput ? eventDescInput.value : '',
            event_type: formattedEventType,
        };

        const csrftoken = getCookie('csrftoken');
        try {
            const response = await fetch('/api/add-event/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify(eventData),
            });

            if (response.ok) {
                location.reload(); // Reload the page to show the new event from the server
            } else {
                alert('Failed to save event. Please try again.');
            }
        } catch (error) {
            console.error("Error saving event:", error);
            alert('An error occurred while saving the event.');
        }
    }
    
    function initButtons() {
        const saveBtn = document.getElementById('saveButton');
        const cancelBtn = document.getElementById('cancelButton');
        if (saveBtn) saveBtn.addEventListener('click', saveEvent);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    }
    
    document.addEventListener('DOMContentLoaded', async () => {
        if (document.getElementById('assignmentCalendar')) {
            initButtons();
            try {
                const response = await fetch('/api/events/');
                events = await response.json();
                load(); // Initial calendar render
            } catch (error) {
                console.error("Failed to load events for calendar:", error);
            }
            window.addEventListener('nav-change', (e) => {
                nav = e.detail.nav;
                load();
            });
        }
    });
})();

// ============================================================================
// MODULE: College Logic (formerly college.js)
// ============================================================================
(function() {
    let nav = 0; // Shared navigation offset
    let events = [];
    
    const pendingList = document.getElementById('pendingAssignmentsList');
    const completedList = document.getElementById('completedAssignmentsList');
    const upcomingList = document.getElementById('upcomingAssignmentsList');
    
    async function addAssignmentFromInput(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        const titleInput = document.getElementById('assignmentTitleInput');
        const dateInput = document.getElementById('assignmentDateInput');
        const typeSelect = document.getElementById('eventTypeSelect');
    
        if (!titleInput || !dateInput) {
            alert('Form inputs not found (expected IDs: assignmentTitleInput, assignmentDateInput).');
            return;
        }
        
        if (!titleInput.value.trim() || !dateInput.value.trim()) {
            if (!titleInput.value.trim()) titleInput.classList.add('error');
            if (!dateInput.value.trim()) dateInput.classList.add('error');
            alert('Please provide both a title and a date.');
            return;
        }

        titleInput.classList.remove('error');
        dateInput.classList.remove('error');

        let dateString = dateInput.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const date = new Date(dateInput.value);
            if (!isNaN(date.getTime())) {
                dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
        }
        const eventType = typeSelect ? typeSelect.value : 'Assignment';
        const formattedEventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);

        const newAssignmentData = {
            date: dateString,
            title: titleInput.value,
            description: '',
            event_type: formattedEventType,
        };

        const csrftoken = getCookie('csrftoken');
        try {
            const response = await fetch('/api/add-event/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify(newAssignmentData),
            });

            if (response.ok) {
                location.reload(); // Reload page to show new event
            } else {
                alert('Failed to add assignment.');
            }
        } catch (error) {
            console.error("Error adding assignment:", error);
            alert('An error occurred while adding the assignment.');
        }
    }
    
    async function deleteEvent(eventId) {
        // This requires a backend endpoint. For now, this functionality is disabled.
        alert('Deleting events is not yet supported.');
    }
    
    async function toggleEvent(eventId) {
        // This requires a backend endpoint. For now, this functionality is disabled.
        alert('Updating event status is not yet supported.');
        // Re-enable checkbox if you implement this
        const checkbox = document.querySelector(`input[data-event-id='${eventId}']`);
        if (checkbox) checkbox.checked = !checkbox.checked; // Revert UI change
    }

    async function editEvent(eventId) {
        // This requires a backend endpoint. For now, this functionality is disabled.
        alert('Editing events is not yet supported.');
    }
    
    function saveAndRender() {
        // This function previously saved to localStorage.
        // Now it just re-renders the lists from the in-memory 'events' array.
        loadAssignmentLists();
    }
    
    function loadAssignmentLists() {
        if (pendingList) pendingList.innerHTML = '';
        if (completedList) completedList.innerHTML = '';
        if (upcomingList) upcomingList.innerHTML = '';
    
        const dt = new Date();
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav);
        }
        const currentMonth = dt.getMonth();
        const currentYear = dt.getFullYear();
        const year = currentYear; // for the display string
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison
    
        const currentMonthDisplay = document.getElementById('currentMonthDisplay');
        if (currentMonthDisplay) {
            currentMonthDisplay.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
        }
    
        const assignments = events.filter(e => {
            const eventDate = new Date(e.date + 'T00:00:00'); // Avoid timezone issues
            return e.event_type === 'Assignment' && eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });
    
        assignments.forEach(a => {
            const assignmentItem = document.createElement('li');
            assignmentItem.className = 'assignment-item';
            assignmentItem.innerHTML = `
                <div>
                    <input type="checkbox" data-event-id="${a.id}" ${a.completed ? 'checked' : ''} disabled>
                    <span class="task-text ${a.completed ? 'completed' : ''}">${a.title} ${a.date ? `(${formatDateToDDMMYYYY(a.date)})` : ''}</span>
                </div>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
    
            // NOTE: Event listeners for toggle, delete, and edit are disabled
            // because they require backend implementation.
            // assignmentItem.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleEvent(a.id));
            // assignmentItem.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(a.id));
            // assignmentItem.querySelector('.edit-btn').addEventListener('click', () => editEvent(a.id));
    
            const eventDate = new Date(a.date + 'T00:00:00');
    
            if (a.completed) {
                if (completedList) completedList.appendChild(assignmentItem);
            } else if (eventDate > today || a.status === 'upcoming') {
                if (upcomingList) upcomingList.appendChild(assignmentItem);
            } else if (a.status === 'pending') { // Only show 'pending' status here
                if (pendingList) pendingList.appendChild(assignmentItem);
            }
        });
    
        // This ensures the accordion state is respected on re-render
        document.querySelectorAll('.accordion-toggle').forEach(button => {
            const content = button.nextElementSibling;
            if (content && button.classList.contains('active')) {
                content.classList.add('active');
            }
        });
    }
    
    function initCollegeSection() {
        // Initialize button listeners first (before any early returns)
        const addAssignmentButton = document.getElementById('assignmentAddButton');
        if (addAssignmentButton) {
            addAssignmentButton.addEventListener('click', addAssignmentFromInput);
        } else {
            const fallbackButtons = document.querySelectorAll('.add-btn');
            fallbackButtons.forEach(btn => {
                btn.addEventListener('click', addAssignmentFromInput);
            });
        }

        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nav++;
                loadAssignmentLists();
                window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
            });
        }

        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                nav--;
                loadAssignmentLists();
                window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
            });
        }

        document.querySelectorAll('.accordion-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                button.classList.toggle('active');
                content.classList.toggle('active');
                if (button.classList.contains('active')) {
                    content.classList.add('active');
                }
            });
        });

        if (!pendingList) return; // Added safety check so merged file doesn't throw errors on other pages

        // Initial render with loading state
        pendingList.innerHTML = '<p>Loading assignments...</p>';
    }

    document.addEventListener('DOMContentLoaded', async () => {
        initCollegeSection();
        try {
            const response = await fetch('/api/events/');
            events = await response.json();
            loadAssignmentLists();
        } catch (error) {
            console.error("Failed to load events for lists:", error);
            if (pendingList) pendingList.innerHTML = '<p>Error loading assignments.</p>';
        }
    });
})();

// ============================================================================
// MODULE: Task Calendar (formerly calendar.js)
// ============================================================================
(function() {
    let nav = 0; // This will be synced with upskill.js
    let clicked = null;
   let tasks = [];

fetch('/api/events/')
    .then(res => res.json())
    .then(data => {
        tasks = data;
        load();
    });
    
    const calendar = document.getElementById('taskCalendar');
    const newTaskModal = document.getElementById('newTaskModal');
    const backDrop = document.getElementById('modalBackDrop');
    const tasksForDayDiv = document.getElementById('tasksForDay');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescInput = document.getElementById('taskDescInput'); // New description input
    const taskStatusSelect = document.getElementById('taskStatusSelect'); // New status select
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    function openModal(date) {
        clicked = date;
        const tasksOnDay = tasks.filter(t => t.date.replace(/-/g, '/') === clicked.replace(/-/g, '/'));
    
        if (tasksOnDay.length > 0) {
            if (tasksForDayDiv) tasksForDayDiv.innerHTML = '';
            tasksOnDay.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task-item-modal');
                taskEl.innerHTML = `
                    <strong>${task.text}</strong>
                    <p>${task.description || (task.date ? `Due: ${task.date}` : 'No description')}</p>
                    <span class="status-badge ${task.status}">${task.status}</span>
                `;
                if (tasksForDayDiv) tasksForDayDiv.appendChild(taskEl);
            });
        } else {
            if (tasksForDayDiv) tasksForDayDiv.innerHTML = '<p>No tasks for this day. Add one below!</p>';
        }
    
        if (newTaskModal) newTaskModal.style.display = 'block';
        if (backDrop) backDrop.style.display = 'block';
    }
    
    function load() {
        const dt = new Date();
    
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav);
        }
    
        const day = dt.getDate();
        const month = dt.getMonth();
        const year = dt.getFullYear();
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of today for accurate comparison
    
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
        const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
    
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
        }
    
        calendar.innerHTML = '';
    
        // Render calendar headers
        weekdays.forEach(day => {
            const daySquare = document.createElement('div');
            daySquare.classList.add('calendar-header');
            daySquare.innerText = day.substring(0, 3).toUpperCase();
            calendar.appendChild(daySquare);
        });
    
        for (let i = 1; i <= paddingDays + daysInMonth; i++) {
            const daySquare = document.createElement('div');
            daySquare.classList.add('calendar-day');
    
            const dayString = `${year}/${String(month + 1).padStart(2, '0')}/${String(i - paddingDays).padStart(2, '0')}`;
    
            if (i > paddingDays) {
                daySquare.innerText = i - paddingDays;
    
                const tasksForDay = tasks.filter(t => t.date && t.date.replace(/-/g, '/') === dayString);
    
                if (i - paddingDays === day && nav === 0) {
                    daySquare.id = 'currentDay';
                }
    
                if (tasksForDay.length > 0) {
                    const eventsContainer = document.createElement('div');
                    eventsContainer.className = 'calendar-events';
                    tasksForDay.forEach(task => {
                        const eventIndicator = document.createElement('div');
                        
                        const taskDate = new Date(task.date);
                        let taskStatus;
                        if (task.completed) {
                            taskStatus = 'completed';
                        } else if (taskDate > today) {
                            taskStatus = 'upcoming';
                        } else {
                            taskStatus = 'pending';
                        }
    
                        eventIndicator.className = 'event-indicator';
                        eventIndicator.setAttribute('data-status', taskStatus);
                        eventIndicator.innerHTML = `
                            <span class="event-title">${task.text}</span><div class="event-popup">
                                <strong>${task.text}</strong>
                                <p>${task.description || 'No description.'}</p>
                            </div>
                        `;
                        // Add a click listener to the event indicator itself to open the edit modal
                        eventIndicator.addEventListener('click', (e) => {
                            e.stopPropagation(); // Prevent the day's click event from firing
                            if (window.openEditModal) window.openEditModal(task.id);
                        });
                        eventsContainer.appendChild(eventIndicator);
                    });
                    daySquare.appendChild(eventsContainer);
                }
    
                daySquare.addEventListener('click', () => openModal(dayString));
            } else {
                daySquare.classList.add('padding');
            }
    
            calendar.appendChild(daySquare);
        }
    }
    
    function closeModal() {
        if (taskTitleInput) taskTitleInput.classList.remove('error');
        if (newTaskModal) newTaskModal.style.display = 'none';
        if (backDrop) backDrop.style.display = 'none';
        if (taskTitleInput) taskTitleInput.value = '';
        if (taskStatusSelect) taskStatusSelect.value = 'pending';
        if (taskDescInput) taskDescInput.value = '';
        clicked = null;
        load();
    }
    
 async function saveTask(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (!taskTitleInput.value.trim()) {
        alert('Enter title');
        return;
    }

    const csrftoken = getCookie('csrftoken');

    const taskData = {
        title: taskTitleInput.value,
        date: clicked ? clicked.replace(/\//g, '-') : '',
        description: taskDescInput ? taskDescInput.value : '',
        event_type: "Task"
    };

    const response = await fetch('/api/add-event/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(taskData)
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Failed to save task");
    }
}
    
    function initButtons() {
        const saveBtn = document.getElementById('saveButton');
        const cancelBtn = document.getElementById('cancelButton');
        if (saveBtn) saveBtn.addEventListener('click', saveTask);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    }
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure calendar-specific buttons are initialized only if they exist on the page
        if (document.getElementById('taskCalendar')) {
            initButtons();
            load();
    
            window.addEventListener('nav-change', (e) => {
                nav = e.detail.nav;
                load();
            });
    
            window.addEventListener('tasks-updated', (e) => {
                tasks = JSON.parse(localStorage.getItem('upskillTasks') || '[]');
                load();
            });
        }
    });
})();
console.log("JS LOADED");