// Force light mode and disable all animations dynamically (Applied Globally)
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
// MODULE: College Calendar (formerly college-calendar.js)
// ============================================================================
(function() {
    let nav = 0; // This will be synced with college.js
    let clicked = null;
    let events = JSON.parse(localStorage.getItem('events') || '[]');
    
    const calendar = document.getElementById('assignmentCalendar');
    const newAssignmentModal = document.getElementById('newAssignmentModal');
    const backDrop = document.getElementById('modalBackDrop');
    const eventTitleInput = document.getElementById('eventTitleInput');
    const eventDescInput = document.getElementById('eventDescInput');
    const eventTypeSelectModal = document.getElementById('eventTypeSelectModal');
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

        newAssignmentModal.style.display = 'block';
        backDrop.style.display = 'block';
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
        eventTitleInput.classList.remove('error');
        newAssignmentModal.style.display = 'none';
        backDrop.style.display = 'none';
        eventTitleInput.value = '';
        eventDescInput.value = '';
        if (eventTypeSelectModal) {
            eventTypeSelectModal.value = 'assignment';
        }
        clicked = null;
        load();
    }
    
    function saveEvent() {
        if (eventTitleInput.value) {
            eventTitleInput.classList.remove('error');
            const eventType = eventTypeSelectModal ? eventTypeSelectModal.value : 'assignment';
            let status = 'pending';
            if (eventType === 'exam') {
                status = 'exam';
            } else if (eventType === 'holiday') {
                status = 'holiday';
            }
    
            events.push({
                date: clicked, // Stored in YYYY-MM-DD format
                title: eventTitleInput.value,
                description: eventDescInput.value,
                status: status,
                type: eventType,
                completed: false,
            });
    
            localStorage.setItem('events', JSON.stringify(events));
            closeModal();
            window.dispatchEvent(new Event('events-updated')); // Notify college.js
        } else {
            eventTitleInput.classList.add('error');
        }
    }
    
    function initButtons() {
        document.getElementById('saveButton').addEventListener('click', saveEvent);
        document.getElementById('cancelButton').addEventListener('click', closeModal);
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('assignmentCalendar')) {
            initButtons();
            load();
    
            window.addEventListener('nav-change', (e) => {
                nav = e.detail.nav;
                load();
            });
    
            window.addEventListener('events-updated', (e) => {
                events = JSON.parse(localStorage.getItem('events') || '[]');
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
    
    async function addAssignmentFromInput() {
        const titleInput = document.getElementById('assignmentTitleInput');
        const dateInput = document.getElementById('assignmentDateInput');
        const typeSelect = document.getElementById('eventTypeSelect');
    
        if (titleInput.value && dateInput.value) {
            const date = new Date(dateInput.value);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const eventType = typeSelect.value;
            let status;
            if (eventType === 'assignment') {
                status = 'pending';
            } else if (eventType === 'exam') {
                status = 'exam';
            } else if (eventType === 'holiday') {
                status = 'holiday';
            }
            const newAssignmentData = {
                date: dateString,
                title: titleInput.value,
                description: '',
                status: status,
                completed: false,
                type: eventType
            };
    
            events.push({ id: `local-${Date.now()}`, ...newAssignmentData });
            saveAndRender();
    
            titleInput.value = '';
            dateInput.value = '';
            typeSelect.value = 'assignment';
        }
    }
    
    async function deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            events = events.filter(e => e.id !== eventId);
            saveAndRender();
        }
    }
    
    async function toggleEvent(eventId) {
        const event = events.find(e => e.id === eventId);
        if (event) {
            const newCompletedStatus = !event.completed;
            event.completed = newCompletedStatus;
            event.status = newCompletedStatus ? 'completed' : 'pending';
            saveAndRender();
        }
    }
    
    function saveAndRender() {
        localStorage.setItem('events', JSON.stringify(events));
        loadAssignmentLists();
        // Also notify calendar to re-render
        window.dispatchEvent(new Event('events-updated'));
    }
    
    function loadAssignmentLists() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';
        upcomingList.innerHTML = '';
    
        const dt = new Date();
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav);
        }
        const currentMonth = dt.getMonth();
        const currentYear = dt.getFullYear();
        const year = currentYear; // for the display string
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison
    
        document.getElementById('currentMonthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
    
        const assignments = events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });
    
        assignments.forEach(a => {
            const assignmentItem = document.createElement('li');
            assignmentItem.className = 'assignment-item';
            assignmentItem.innerHTML = `
                <div>
                    <input type="checkbox" ${a.completed ? 'checked' : ''}>
                    <span class="task-text ${a.completed ? 'completed' : ''}">${a.title} ${a.date ? `(${formatDateToDDMMYYYY(a.date)})` : ''}</span>
                </div>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
    
            assignmentItem.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleEvent(a.id));
            assignmentItem.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(a.id));
            // Placeholder for edit functionality
            assignmentItem.querySelector('.edit-btn').addEventListener('click', () => alert('Edit functionality coming soon!'));
    
            const eventDate = new Date(a.date);
    
            if (a.completed) {
                completedList.appendChild(assignmentItem);
            } else if (eventDate > today || a.status === 'upcoming') {
                upcomingList.appendChild(assignmentItem);
            } else if (a.status === 'pending') { // Only show 'pending' status here
                pendingList.appendChild(assignmentItem);
            }
        });
    
        // This ensures the accordion state is respected on re-render
        document.querySelectorAll('.accordion-toggle').forEach(button => {
            const content = button.nextElementSibling;
            if (button.classList.contains('active')) {
                content.classList.add('active');
            }
        });
    }
    
    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
        if (!pendingList) return; // Added safety check so merged file doesn't throw errors on other pages

        // Initial render with loading state
        if(pendingList) pendingList.innerHTML = '<p>Loading assignments...</p>';
    
        // Load from localStorage
        events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
        loadAssignmentLists();
    
        document.querySelector('.subsection .add-btn').addEventListener('click', addAssignmentFromInput);
    
        document.getElementById('nextButton').addEventListener('click', () => {
            nav++;
            loadAssignmentLists();
            window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
        });
    
        document.getElementById('backButton').addEventListener('click', () => {
            nav--;
            loadAssignmentLists();
            window.dispatchEvent(new CustomEvent('nav-change', { detail: { nav } }));
        });
    
        document.querySelectorAll('.accordion-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                button.classList.toggle('active');
                content.classList.toggle('active');
                // Ensure the content has the active class if the button does
                if (button.classList.contains('active')) {
                    content.classList.add('active');
                }
            });
        });
    
    });
    
    window.addEventListener('events-updated', (e) => {
        events = JSON.parse(localStorage.getItem('events') || '[]');
        loadAssignmentLists();
    });
})();

// ============================================================================
// MODULE: Task Calendar (formerly calendar.js)
// ============================================================================
(function() {
    let nav = 0; // This will be synced with upskill.js
    let clicked = null;
    let tasks = JSON.parse(localStorage.getItem('upskillTasks') || '[]');
    
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
            tasksForDayDiv.innerHTML = '';
            tasksOnDay.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task-item-modal');
                taskEl.innerHTML = `
                    <strong>${task.text}</strong>
                    <p>${task.description || (task.date ? `Due: ${task.date}` : 'No description')}</p>
                    <span class="status-badge ${task.status}">${task.status}</span>
                `;
                tasksForDayDiv.appendChild(taskEl);
            });
        } else {
            tasksForDayDiv.innerHTML = '<p>No tasks for this day. Add one below!</p>';
        }
    
        newTaskModal.style.display = 'block';
        backDrop.style.display = 'block';
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
    
        document.getElementById('currentMonth').innerText =
            `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
    
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
        taskTitleInput.classList.remove('error');
        newTaskModal.style.display = 'none';
        backDrop.style.display = 'none';
        taskTitleInput.value = '';
        taskStatusSelect.value = 'pending';
        taskDescInput.value = '';
        clicked = null;
        load();
    }
    
    function saveTask() {
        if (taskTitleInput.value) {
            taskTitleInput.classList.remove('error');
    
            tasks.push({
                id: Date.now(),
                text: taskTitleInput.value,
                date: clicked.replace(/\//g, '-'), // Store in YYYY-MM-DD format
                description: taskDescInput.value,
                status: taskStatusSelect.value,
                completed: taskStatusSelect.value === 'completed',
            });
    
            localStorage.setItem('upskillTasks', JSON.stringify(tasks));
            closeModal();
            window.dispatchEvent(new Event('tasks-updated')); // Notify upskill.js
        } else {
            taskTitleInput.classList.add('error');
        }
    }
    
    function initButtons() {
        document.getElementById('saveButton').addEventListener('click', saveTask);
        document.getElementById('cancelButton').addEventListener('click', closeModal);
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
