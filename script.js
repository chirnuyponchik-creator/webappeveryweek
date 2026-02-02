// ==========================================
// 1. CONFIG & TRANSLATIONS
// ==========================================

const TRANSLATIONS = {
    en: {
        appTitle: "My Week",
        newTask: "New Task",
        editTask: "Edit Task",
        viewTitle: "View Task",
        lblTitle: "Title",
        lblDay: "Day of Week",
        lblTime: "Time",
        lblTimeDate: "Time & Day",
        lblPermanent: "Permanent Task",
        hintPermanent: "Repeat every week",
        lblDesc: "Description",
        btnSave: "Save",
        btnDelete: "Delete",
        btnEdit: "Edit Task",
        noDesc: "No description provided.",
        noTasks: "No tasks planned",
        alertTitleTime: "Please enter title and time!",
        alertDay: "Please select a day!",
        confirmDelete: "Delete this task?",
        daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        daysFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        dateFormat: 'en-US',
        placeholderTitle: "E.g.: Morning workout",
        placeholderDesc: "Add details...",
        lblTheme: "Theme",
        themeLight: "Light",
        themeDark: "Dark"
    },
    uk: {
        appTitle: "Мій Тиждень",
        newTask: "Нове завдання",
        editTask: "Редагування",
        viewTitle: "Деталі завдання",
        lblTitle: "Назва",
        lblDay: "День тижня",
        lblTime: "Час",
        lblTimeDate: "Час і День",
        lblPermanent: "Постійне завдання",
        hintPermanent: "Повторювати щотижня",
        lblDesc: "Опис",
        btnSave: "Зберегти",
        btnDelete: "Видалити",
        btnEdit: "Редагувати",
        noDesc: "Опис відсутній",
        noTasks: "Немає завдань",
        alertTitleTime: "Заповніть назву та час!",
        alertDay: "Оберіть день тижня!",
        confirmDelete: "Видалити це завдання?",
        daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
        daysFull: ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя'],
        dateFormat: 'uk-UA',
        placeholderTitle: "Напр.: Тренування",
        placeholderDesc: "Деталі...",
        lblTheme: "Тема",
        themeLight: "Світла",
        themeDark: "Темна"
    },
    ru: {
        appTitle: "Моя Неделя",
        newTask: "Новая задача",
        editTask: "Редактирование",
        viewTitle: "Просмотр задачи",
        lblTitle: "Название",
        lblDay: "День недели",
        lblTime: "Время",
        lblTimeDate: "Время и День",
        lblPermanent: "Постоянная задача",
        hintPermanent: "Повторять каждую неделю",
        lblDesc: "Описание",
        btnSave: "Сохранить",
        btnDelete: "Удалить",
        btnEdit: "Редактировать",
        noDesc: "Нет описания",
        noTasks: "Нет задач",
        alertTitleTime: "Заполните название и время!",
        alertDay: "Выберите день недели!",
        confirmDelete: "Удалить эту задачу?",
        daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        daysFull: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        dateFormat: 'ru-RU',
        placeholderTitle: "Напр: Сделать отчёт",
        placeholderDesc: "Детали задачи...",
        lblTheme: "Тема",
        themeLight: "Светлая",
        themeDark: "Темная"
    }
};

// СМЕНИЛ ВЕРСИЮ НА v5, ЧТОБЫ ОЧИСТИТЬ СТАРЫЕ ГЛЮЧНЫЕ ДАННЫЕ
const STORAGE_KEY = 'weekly_planner_data_v5';
const LIMIT_START_DATE = new Date('2026-02-02T00:00:00').getTime();

let state = {
    viewWeekStart: null,
    lang: 'ru',
    theme: 'light',
    tasks: []
};

let currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
let editingTaskId = null;
let viewingTaskId = null;

// DOM Elements
const scheduleTrack = document.getElementById('schedule-track');
const dayNavTrack = document.getElementById('day-nav-track');
const modalForm = document.getElementById('modal-overlay');
const fabBtn = document.getElementById('fab-add');
const closeFormBtn = document.getElementById('modal-close');
const taskForm = document.getElementById('task-form');
const dayInput = document.getElementById('t-day-index');
const modalTitle = document.querySelector('.modal-header h2');
const btnDelete = document.getElementById('btn-delete');

const langTabs = document.querySelectorAll('.lang-tab');
const langGlider = document.querySelector('.lang-glider');

const themeTabs = document.querySelectorAll('.theme-tab');
const themeGlider = document.querySelector('.theme-glider');

const inputTitle = document.getElementById('t-title');
const inputDesc = document.getElementById('t-desc');

const modalView = document.getElementById('view-modal-overlay');
const closeViewBtn = document.getElementById('view-close');
const btnGoToEdit = document.getElementById('btn-to-edit');
const vTitle = document.getElementById('v-title');
const vTimeDate = document.getElementById('v-time-date');
const vDesc = document.getElementById('v-desc');

const btnPrevWeek = document.getElementById('prev-week');
const btnNextWeek = document.getElementById('next-week');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// ==========================================
// DATE HELPERS (FIXED)
// ==========================================

// Возвращает дату в формате "YYYY-MM-DD" строго по местному времени
function getLocalISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Превращает строку "YYYY-MM-DD" в объект Date (00:00 местное время)
function parseLocalYYYYMMDD(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function getMonday(d) {
    d = new Date(d);
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1);
    let monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadData();

    if (!state.viewWeekStart) {
        let nowMonday = getMonday(new Date()).getTime();
        state.viewWeekStart = nowMonday < LIMIT_START_DATE ? LIMIT_START_DATE : nowMonday;
    }

    checkAndGenerateCurrentWeek();

    updateLangTabsUI();
    updateThemeUI();
    applyLanguage();

    renderHeader();
    renderNav();
    renderSchedule();
    updateSliderPosition();
    initSwipe();

    if (btnPrevWeek) btnPrevWeek.addEventListener('click', () => changeWeek(-1));
    if (btnNextWeek) btnNextWeek.addEventListener('click', () => changeWeek(1));
    if (fabBtn) fabBtn.addEventListener('click', openNewTaskModal);
    if (closeFormBtn) closeFormBtn.addEventListener('click', () => modalForm.classList.add('hidden'));
    if (closeViewBtn) closeViewBtn.addEventListener('click', () => modalView.classList.add('hidden'));

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    themeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const newTheme = tab.dataset.theme;
            setTheme(newTheme);
        });
    });

    initCustomTimePicker();
}

// ==========================================
// THEME LOGIC
// ==========================================

function setTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    updateThemeUI();
    saveData();
}

function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const tabsOrder = ['light', 'dark'];
    const activeIndex = tabsOrder.indexOf(state.theme);
    if (themeGlider && activeIndex !== -1) {
        themeGlider.style.transform = `translateX(${activeIndex * 100}%)`;
    }
    themeTabs.forEach(tab => {
        if (tab.dataset.theme === state.theme) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

// ==========================================
// SIDEBAR LOGIC
// ==========================================

function toggleSidebar() {
    const isActive = sidebar.classList.contains('active');
    if (isActive) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.remove('hidden');
    setTimeout(() => sidebarOverlay.classList.add('active'), 10);
    mobileMenuBtn.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
    setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
}

// ==========================================
// DATA & DATE LOGIC (UPDATED FOR SYNC)
// ==========================================

let saveTimeout = null; // Переменная для таймера сохранения

async function loadData() {
    // 1. Сначала грузим из LocalStorage (чтобы интерфейс появился мгновенно)
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const loaded = JSON.parse(raw);
            state.tasks = loaded.tasks || [];
            state.lang = loaded.lang || 'ru';
            state.theme = loaded.theme || 'light';
        } catch (e) {
            console.error("Local data parse error", e);
        }
    } else {
        setupDefaultState();
    }

    // Отрисовываем то, что есть локально
    applyLanguage();
    updateThemeUI();
    renderHeader();
    renderSchedule();

    // 2. Теперь тихо пытаемся подтянуть данные из облака
    try {
        const response = await fetch('/.netlify/functions/api');
        if (response.ok) {
            const cloudData = await response.json();

            // Если в облаке есть данные (не null и есть задачи или настройки)
            if (cloudData && (cloudData.tasks || cloudData.lang)) {
                console.log("Cloud data loaded:", cloudData);

                // Обновляем стейт
                state.tasks = cloudData.tasks || [];
                state.lang = cloudData.lang || state.lang;
                state.theme = cloudData.theme || state.theme;

                // Сохраняем актуальную версию в локалку
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    tasks: state.tasks,
                    lang: state.lang,
                    theme: state.theme
                }));

                // Перерисовываем интерфейс с новыми данными
                applyLanguage();
                updateThemeUI(); // Обновит тему, если она сменилась на другом устройстве
                updateLangTabsUI();
                renderSchedule();
            }
        }
    } catch (error) {
        console.error("Sync error:", error);
        // Если ошибка сети — ничего страшного, пользователь работает с локальной версией
    }
}

function setupDefaultState() {
    state.viewWeekStart = getMonday(new Date()).getTime();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.theme = 'dark';
    }
    // Сохраняем дефолт сразу локально
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: state.tasks,
        lang: state.lang,
        theme: state.theme
    }));
}

function saveData() {
    // 1. Сохраняем в LocalStorage мгновенно (для отзывчивости)
    const dataToSave = {
        tasks: state.tasks,
        lang: state.lang,
        theme: state.theme
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

    // 2. Сохраняем в облако с задержкой (Debounce)
    // Ждем 1 секунду после последнего изменения, прежде чем отправлять запрос
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
        try {
            await fetch('/.netlify/functions/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            console.log("Saved to cloud");
        } catch (error) {
            console.error("Cloud save failed:", error);
        }
    }, 1000); // 1000 мс = 1 секунда
}
function changeWeek(offset) {
    const currentView = new Date(state.viewWeekStart);
    currentView.setDate(currentView.getDate() + (offset * 7));
    const newTime = currentView.getTime();

    const realMonday = getMonday(new Date()).getTime();

    if (offset > 0 && newTime > realMonday) return;
    if (offset < 0 && newTime < LIMIT_START_DATE) return;

    state.viewWeekStart = newTime;
    renderHeader();
    renderSchedule();
}

function updateNavArrows() {
    if (!btnPrevWeek || !btnNextWeek) return;
    const current = state.viewWeekStart;
    const realMonday = getMonday(new Date()).getTime();

    if (current <= LIMIT_START_DATE) btnPrevWeek.classList.add('disabled');
    else btnPrevWeek.classList.remove('disabled');

    if (current >= realMonday) btnNextWeek.classList.add('disabled');
    else btnNextWeek.classList.remove('disabled');
}

// ИСПРАВЛЕННАЯ ГЕНЕРАЦИЯ ЗАДАЧ
function checkAndGenerateCurrentWeek() {
    const realMonday = getMonday(new Date()).getTime();

    // Проверяем, есть ли задачи на текущей неделе, используя правильный парсинг
    const hasTasksForRealWeek = state.tasks.some(t => {
        if (!t.date) return false;
        const tDate = parseLocalYYYYMMDD(t.date).getTime();
        return tDate >= realMonday && tDate < realMonday + (7 * 24 * 60 * 60 * 1000);
    });

    if (!hasTasksForRealWeek && state.tasks.length > 0) {
        // Сортируем чтобы найти последние
        const sortedTasks = [...state.tasks].sort((a, b) => parseLocalYYYYMMDD(b.date) - parseLocalYYYYMMDD(a.date));
        if (sortedTasks.length === 0) return;

        const lastTaskDate = parseLocalYYYYMMDD(sortedTasks[0].date);
        const lastKnownMonday = getMonday(lastTaskDate).getTime();

        // Если последние задачи были в прошлом (не на этой неделе)
        if (lastKnownMonday < realMonday) {
            // Находим все постоянные задачи с той последней недели
            const tasksToCopy = state.tasks.filter(t => {
                if (!t.isPermanent) return false;
                const tDateObj = parseLocalYYYYMMDD(t.date);
                const tMonday = getMonday(tDateObj).getTime();
                return tMonday === lastKnownMonday;
            });

            const newTasks = [];
            tasksToCopy.forEach(task => {
                let newTask = { ...task };
                newTask.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                newTask.isCompleted = false;

                // Рассчитываем новую дату
                let dateObj = new Date(realMonday);
                dateObj.setDate(dateObj.getDate() + newTask.dayIndex);

                // Сохраняем в локальном формате, чтобы не прыгало
                newTask.date = getLocalISODate(dateObj);

                newTasks.push(newTask);
            });

            if (newTasks.length > 0) {
                state.tasks = [...state.tasks, ...newTasks];
                saveData();
            }
        }
    }
}

// ==========================================
// MODAL FORMS
// ==========================================

function openNewTaskModal() {
    const t = TRANSLATIONS[state.lang];
    editingTaskId = null;
    viewingTaskId = null;
    modalTitle.textContent = t.newTask;
    btnDelete.classList.add('hidden');
    taskForm.reset();
    renderModalDaySelector();

    const dayToSelect = (currentDayIndex >= 0 && currentDayIndex <= 6) ? currentDayIndex : 0;
    const container = document.getElementById('day-selector');
    if (container) {
        const btn = container.querySelector(`.day-option[data-day="${dayToSelect}"]`);
        if (btn) btn.classList.add('selected');
    }
    dayInput.value = dayToSelect;
    closeSidebar();
    modalForm.classList.remove('hidden');
}

function renderModalDaySelector() {
    const container = document.getElementById('day-selector');
    if (!container) return;
    container.innerHTML = '';
    const days = TRANSLATIONS[state.lang].daysShort;
    days.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = 'day-option';
        div.textContent = d;
        div.dataset.day = i;
        div.addEventListener('click', () => {
            if (editingTaskId) {
                container.querySelectorAll('.day-option').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                dayInput.value = i;
            } else {
                div.classList.toggle('selected');
                const selected = container.querySelectorAll('.day-option.selected');
                dayInput.value = selected.length > 0 ? selected[0].dataset.day : '';
            }
        });
        container.appendChild(div);
    });
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = TRANSLATIONS[state.lang];
    const title = document.getElementById('t-title').value.trim();
    const time = document.getElementById('t-time').value;
    const isPermanent = document.getElementById('t-permanent').checked;
    const desc = document.getElementById('t-desc').value.trim();

    if (!title || !time) { alert(t.alertTitleTime); return; }
    const selectedDaysElements = document.querySelectorAll('.day-option.selected');
    const selectedIndices = Array.from(selectedDaysElements).map(el => parseInt(el.dataset.day));
    if (selectedIndices.length === 0) { alert(t.alertDay); return; }

    if (editingTaskId) {
        updateExistingTask(editingTaskId, title, selectedIndices[0], time, isPermanent, desc);
    } else {
        saveNewTasks(title, selectedIndices, time, isPermanent, desc);
    }
    modalForm.classList.add('hidden');
});

if (btnDelete) btnDelete.addEventListener('click', () => { if (editingTaskId) deleteTask(editingTaskId); });

// ==========================================
// RENDER & HELPERS
// ==========================================

function renderHeader() {
    const start = new Date(state.viewWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const locale = TRANSLATIONS[state.lang].dateFormat;
    document.getElementById('current-week-dates').textContent =
        `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    updateNavArrows();
}

function renderNav() {
    const days = TRANSLATIONS[state.lang].daysShort;
    const currentDayOfWeek = (new Date().getDay() + 6) % 7;
    const viewMonday = state.viewWeekStart;
    const realMonday = getMonday(new Date()).getTime();
    const isCurrentWeekView = viewMonday === realMonday;

    dayNavTrack.innerHTML = days.map((d, i) => {
        const isToday = isCurrentWeekView && (i === currentDayOfWeek);
        return `<button class="nav-btn ${isToday ? 'today' : ''}" onclick="goToDay(${i})">${d}</button>`;
    }).join('');
    updateNavHighlight();
}

function updateNavHighlight() {
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach((btn, i) => {
        if (i === currentDayIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    if (btns[currentDayIndex]) {
        btns[currentDayIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

function renderSchedule() {
    scheduleTrack.innerHTML = '';
    const daysFull = TRANSLATIONS[state.lang].daysFull;
    const locale = TRANSLATIONS[state.lang].dateFormat;
    const viewMonday = new Date(state.viewWeekStart);

    for (let i = 0; i < 7; i++) {
        let dateObj = new Date(viewMonday);
        dateObj.setDate(viewMonday.getDate() + i);
        let dateStr = dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
        // Используем нашу функцию для получения строки сравнения
        let dateIso = getLocalISODate(dateObj);

        let dayTasks = state.tasks.filter(t => t.date === dateIso);
        dayTasks.sort((a, b) => a.time.localeCompare(b.time));

        const slide = document.createElement('div');
        slide.className = 'day-slide';
        let html = `
            <div class="day-header-inline">
                ${daysFull[i]} 
                <span style="font-weight:600; font-size: 14px; opacity:0.5;">${dateStr}</span>
            </div>
        `;
        if (dayTasks.length === 0) {
            html += `
                <div style="display:flex; flex-direction:column; align-items:center; margin-top:60px; opacity:0.4; color: var(--text-secondary);">
                    <i class="ph-duotone ph-coffee" style="font-size:48px; margin-bottom:10px;"></i>
                    <span style="font-size:14px; font-weight:600;">${TRANSLATIONS[state.lang].noTasks}</span>
                </div>
            `;
        } else {
            dayTasks.forEach(task => {
                const checked = task.isCompleted ? 'checked' : '';
                const completedCls = task.isCompleted ? 'completed' : '';
                html += `
                <div class="task-card ${completedCls}">
                    ${task.isPermanent ? '<div class="permanent-stripe"></div>' : ''}
                    <label class="checkbox-wrapper">
                        <input type="checkbox" ${checked} onchange="toggleTaskStatus('${task.id}')">
                        <span class="checkmark"></span>
                    </label>
                    <div class="task-content" onclick="openViewModal('${task.id}')">
                        <div class="task-time">${task.time}</div>
                        <div class="task-title">
                            ${task.title} 
                            ${task.isPermanent ? '<i class="ph-bold ph-infinity perm-icon"></i>' : ''}
                        </div>
                        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                    </div>
                </div>`;
            });
        }
        slide.innerHTML = html;
        scheduleTrack.appendChild(slide);
    }
}

function saveNewTasks(title, dayIndices, time, isPermanent, desc) {
    const viewMonday = new Date(state.viewWeekStart);
    dayIndices.forEach(dayIndex => {
        let taskDate = new Date(viewMonday);
        taskDate.setDate(viewMonday.getDate() + dayIndex);
        state.tasks.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title, dayIndex, time, isPermanent, description: desc,
            // ИСПРАВЛЕНО: Сохраняем дату локально
            date: getLocalISODate(taskDate),
            isCompleted: false
        });
    });
    saveData();
    renderSchedule();
}

function updateExistingTask(id, title, dayIndex, time, isPermanent, desc) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        const oldTask = state.tasks[idx];
        const taskDateObj = parseLocalYYYYMMDD(oldTask.date);
        const currentMonday = getMonday(taskDateObj);

        let newDate = new Date(currentMonday);
        newDate.setDate(currentMonday.getDate() + dayIndex);

        state.tasks[idx] = {
            ...state.tasks[idx],
            title, dayIndex, time, isPermanent, description: desc,
            // ИСПРАВЛЕНО: Сохраняем дату локально
            date: getLocalISODate(newDate)
        };
        saveData();
        renderSchedule();
    }
}

function deleteTask(id) {
    if (!confirm(TRANSLATIONS[state.lang].confirmDelete)) return;
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
    renderSchedule();
    modalForm.classList.add('hidden');
    modalView.classList.add('hidden');
}

function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.isCompleted = !task.isCompleted; saveData(); renderSchedule(); }
}

function applyLanguage() {
    const t = TRANSLATIONS[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    if (inputTitle) inputTitle.placeholder = t.placeholderTitle;
    if (inputDesc) inputDesc.placeholder = t.placeholderDesc;
}

langTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        state.lang = tab.getAttribute('data-lang');
        updateLangTabsUI();
        saveData();
        applyLanguage();
        renderHeader(); renderNav(); renderSchedule();
    });
});

function updateLangTabsUI() {
    const langsOrder = ['en', 'uk', 'ru'];
    const activeIndex = langsOrder.indexOf(state.lang);
    if (langGlider && activeIndex !== -1) langGlider.style.transform = `translateX(${activeIndex * 100}%)`;
    langTabs.forEach(tab => {
        if (tab.getAttribute('data-lang') === state.lang) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

window.goToDay = function (index) {
    currentDayIndex = Math.max(0, Math.min(6, index));
    updateSliderPosition();
    updateNavHighlight();
};

function updateSliderPosition() {
    scheduleTrack.style.transform = `translateX(-${currentDayIndex * 100}%)`;
}

function initSwipe() {
    let startX = 0;
    const viewport = document.getElementById('schedule-viewport');
    viewport.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].screenX;
        if (diff > 50) goToDay(currentDayIndex + 1);
        else if (diff < -50) goToDay(currentDayIndex - 1);
    }, { passive: true });
}

window.openViewModal = function (id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const t = TRANSLATIONS[state.lang];
    viewingTaskId = id;
    vTitle.textContent = task.title;
    vTimeDate.textContent = `${t.daysFull[task.dayIndex]} • ${task.time}`;
    vDesc.textContent = task.description || t.noDesc;
    modalView.classList.remove('hidden');
};

if (btnGoToEdit) btnGoToEdit.addEventListener('click', () => {
    modalView.classList.add('hidden');
    const task = state.tasks.find(t => t.id === viewingTaskId);
    if (task) {
        editingTaskId = viewingTaskId;
        modalTitle.textContent = TRANSLATIONS[state.lang].editTask;
        btnDelete.classList.remove('hidden');
        document.getElementById('t-title').value = task.title;
        document.getElementById('t-time').value = task.time;
        document.getElementById('t-permanent').checked = task.isPermanent;
        document.getElementById('t-desc').value = task.description || '';
        renderModalDaySelector();
        dayInput.value = task.dayIndex;
        const container = document.getElementById('day-selector');
        const btn = container.querySelector(`.day-option[data-day="${task.dayIndex}"]`);
        if (btn) btn.classList.add('selected');

        modalForm.classList.remove('hidden');
    }
});

// ==========================================
// TIME PICKER
// ==========================================

const timeInputTrigger = document.getElementById('t-time');
const pickerOverlay = document.getElementById('ios-time-picker');
const pickerDoneBtn = document.getElementById('picker-done-btn');
const colHours = document.getElementById('col-hours');
const colMinutes = document.getElementById('col-minutes');
const ITEM_HEIGHT = 44;
const PADDING_OFFSET = (220 / 2) - (ITEM_HEIGHT / 2);

function initCustomTimePicker() {
    const createItems = (cont, count) => {
        cont.innerHTML = '';
        const padTop = document.createElement('div');
        padTop.style.height = `${PADDING_OFFSET}px`;
        cont.appendChild(padTop);

        for (let i = 0; i < count; i++) {
            const d = document.createElement('div');
            d.className = 'picker-item';
            d.textContent = i.toString().padStart(2, '0');
            cont.appendChild(d);
        }

        const padBot = document.createElement('div');
        padBot.style.height = `${PADDING_OFFSET}px`;
        cont.appendChild(padBot);
    };

    createItems(colHours, 24);
    createItems(colMinutes, 60);

    setupColumnLogic(colHours);
    setupColumnLogic(colMinutes);

    timeInputTrigger.addEventListener('click', () => {
        pickerOverlay.classList.remove('hidden');
        setTimeout(() => pickerOverlay.classList.add('active'), 10);

        let [h, m] = timeInputTrigger.value.split(':').map(Number);
        if (isNaN(h)) h = 12;
        if (isNaN(m)) m = 0;

        scrollToIndex(colHours, h, false);
        scrollToIndex(colMinutes, m, false);
    });

    pickerDoneBtn.addEventListener('click', () => {
        const h = getCurrentIndex(colHours);
        const m = getCurrentIndex(colMinutes);
        const validH = Math.min(Math.max(0, h), 23);
        const validM = Math.min(Math.max(0, m), 59);
        timeInputTrigger.value = `${validH.toString().padStart(2, '0')}:${validM.toString().padStart(2, '0')}`;
        pickerOverlay.classList.remove('active');
        setTimeout(() => pickerOverlay.classList.add('hidden'), 300);
    });

    pickerOverlay.addEventListener('click', (e) => {
        if (e.target === pickerOverlay) {
            pickerOverlay.classList.remove('active');
            setTimeout(() => pickerOverlay.classList.add('hidden'), 300);
        }
    });
}

function setupColumnLogic(element) {
    let isDragging = false;
    let startY = 0;
    let currentScroll = 0;
    let velocity = 0;
    let lastY = 0;
    let lastTime = 0;
    let animationFrame;

    element.addEventListener('wheel', (e) => {
        e.preventDefault();
        element.scrollTop += e.deltaY;
        updateHighlight(element);
        clearTimeout(element.snapTimeout);
        element.snapTimeout = setTimeout(() => snapToGrid(element), 100);
    });

    const startDrag = (y) => {
        isDragging = true;
        startY = y;
        currentScroll = element.scrollTop;
        lastY = y;
        lastTime = Date.now();
        velocity = 0;
        cancelAnimationFrame(animationFrame);
    };

    element.addEventListener('mousedown', (e) => startDrag(e.clientY));
    element.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientY), { passive: false });

    const moveDrag = (y) => {
        if (!isDragging) return;
        const delta = startY - y;
        element.scrollTop = currentScroll + delta;

        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) {
            velocity = (lastY - y) / dt;
            lastY = y;
            lastTime = now;
        }
        updateHighlight(element);
    };

    window.addEventListener('mousemove', (e) => {
        if (isDragging) { e.preventDefault(); moveDrag(e.clientY); }
    });
    window.addEventListener('touchmove', (e) => {
        if (isDragging) { e.preventDefault(); moveDrag(e.touches[0].clientY); }
    }, { passive: false });

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        inertia();
    };

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    function inertia() {
        const friction = 0.95;
        if (Math.abs(velocity) > 0.1) {
            element.scrollTop += velocity * 10;
            velocity *= friction;
            updateHighlight(element);
            animationFrame = requestAnimationFrame(inertia);
        } else {
            snapToGrid(element);
        }
    }
}

function snapToGrid(element) {
    const index = Math.round(element.scrollTop / ITEM_HEIGHT);
    scrollToIndex(element, index, true);
}

function scrollToIndex(element, index, smooth = true) {
    const targetScroll = index * ITEM_HEIGHT;
    element.scrollTo({
        top: targetScroll,
        behavior: smooth ? 'smooth' : 'auto'
    });
    setTimeout(() => updateHighlight(element), smooth ? 200 : 0);
}

function getCurrentIndex(element) {
    return Math.round(element.scrollTop / ITEM_HEIGHT);
}

function updateHighlight(element) {
    const index = getCurrentIndex(element);
    const items = element.querySelectorAll('.picker-item');
    items.forEach((item, i) => {
        if (i === index) item.classList.add('selected');
        else item.classList.remove('selected');
    });
}