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
        noTasks: "No tasks for today",
        alertTitleTime: "Please enter title and time!",
        alertDay: "Please select a day!",
        confirmDelete: "Delete this task?",
        daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        daysFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        dateFormat: 'en-US',
        placeholderTitle: "E.g.: Morning workout",
        placeholderDesc: "Add details..."
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
        placeholderDesc: "Деталі..."
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
        noTasks: "Нет задач на сегодня",
        alertTitleTime: "Заполните название и время!",
        alertDay: "Выберите день недели!",
        confirmDelete: "Удалить эту задачу?",
        daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        daysFull: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        dateFormat: 'ru-RU',
        placeholderTitle: "Напр: Сделать отчёт",
        placeholderDesc: "Детали задачи..."
    }
};

const STORAGE_KEY = 'weekly_planner_data';

let state = {
    currentWeekStart: null,
    lang: 'en',
    tasks: []
};

let currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
let editingTaskId = null;
let viewingTaskId = null;

// DOM
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

const inputTitle = document.getElementById('t-title');
const inputDesc = document.getElementById('t-desc');

const modalView = document.getElementById('view-modal-overlay');
const closeViewBtn = document.getElementById('view-close');
const btnGoToEdit = document.getElementById('btn-to-edit');
const vTitle = document.getElementById('v-title');
const vTimeDate = document.getElementById('v-time-date');
const vDesc = document.getElementById('v-desc');

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadData();
    updateLangTabsUI();
    applyLanguage();
    checkWeekUpdate();
    renderHeader();
    renderNav();
    renderSchedule();
    updateSliderPosition();
    initSwipe();

    attachTextAnalyzer(inputTitle);
    attachTextAnalyzer(inputDesc);

    initCustomTimePicker();

    // Инициализация свайпов для модальных окон
    initModalSwipe(modalForm);
    initModalSwipe(modalView);
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        const loaded = JSON.parse(raw);
        state.tasks = loaded.tasks || [];
        state.currentWeekStart = loaded.currentWeekStart;
        state.lang = loaded.lang || 'en';
    } else {
        state.currentWeekStart = getMonday(new Date()).getTime();
        state.tasks = [];
        state.lang = 'en';
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ==========================================
// LANG SWITCHER
// ==========================================

function applyLanguage() {
    const t = TRANSLATIONS[state.lang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    if (inputTitle) inputTitle.placeholder = t.placeholderTitle;
    if (inputDesc) inputDesc.placeholder = t.placeholderDesc;
}

const animatedContainers = [
    document.querySelector('.header'),
    document.querySelector('.day-nav'),
    document.querySelector('.schedule-viewport')
];

langTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const selectedLang = tab.getAttribute('data-lang');
        if (state.lang === selectedLang) return;

        state.lang = selectedLang;
        updateLangTabsUI();

        animatedContainers.forEach(el => el.classList.add('content-fading'));

        setTimeout(() => {
            saveData();
            applyLanguage();
            renderHeader();
            renderNav();
            renderModalDaySelector();
            renderSchedule();
            updateSliderPosition();
            setTimeout(() => {
                animatedContainers.forEach(el => el.classList.remove('content-fading'));
            }, 50);
        }, 200);
    });
});

function updateLangTabsUI() {
    const langsOrder = ['en', 'uk', 'ru'];
    const activeIndex = langsOrder.indexOf(state.lang);
    if (langGlider && activeIndex !== -1) {
        langGlider.style.transform = `translateX(${activeIndex * 100}%)`;
    }
    langTabs.forEach(tab => {
        if (tab.getAttribute('data-lang') === state.lang) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

// ==========================================
// DATE LOGIC
// ==========================================

function getMonday(d) {
    d = new Date(d);
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1);
    let monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function checkWeekUpdate() {
    const todayMonday = getMonday(new Date()).getTime();
    if (todayMonday > state.currentWeekStart) {
        migrateTasksToNewWeek(todayMonday);
    }
}

function migrateTasksToNewWeek(newMondayTimestamp) {
    const newTasks = [];
    const newMondayDate = new Date(newMondayTimestamp);
    state.tasks.forEach(task => {
        if (task.isPermanent) {
            let migratedTask = { ...task };
            migratedTask.isCompleted = false;
            let nextDate = new Date(newMondayDate);
            nextDate.setDate(newMondayDate.getDate() + migratedTask.dayIndex);
            migratedTask.date = nextDate.toISOString().split('T')[0];
            newTasks.push(migratedTask);
        }
    });
    state.tasks = newTasks;
    state.currentWeekStart = newMondayTimestamp;
    saveData();
}

// ==========================================
// CRUD
// ==========================================

function saveNewTasks(title, dayIndices, time, isPermanent, desc) {
    const currentMonday = new Date(state.currentWeekStart);
    dayIndices.forEach(dayIndex => {
        let taskDate = new Date(currentMonday);
        taskDate.setDate(currentMonday.getDate() + dayIndex);
        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title, dayIndex, time, isPermanent, description: desc,
            date: taskDate.toISOString().split('T')[0],
            isCompleted: false,
            createdAt: new Date().toISOString()
        };
        state.tasks.push(newTask);
    });
    saveData();
    renderSchedule();
}

function updateExistingTask(id, title, dayIndex, time, isPermanent, desc) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        const currentMonday = new Date(state.currentWeekStart);
        let taskDate = new Date(currentMonday);
        taskDate.setDate(currentMonday.getDate() + dayIndex);
        state.tasks[idx] = {
            ...state.tasks[idx],
            title, dayIndex, time, isPermanent, description: desc,
            date: taskDate.toISOString().split('T')[0]
        };
        saveData();
        renderSchedule();
    }
}

function deleteTask(id) {
    const t = TRANSLATIONS[state.lang];
    if (!confirm(t.confirmDelete)) return;
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
    renderSchedule();
    modalForm.classList.add('hidden');
    modalView.classList.add('hidden');
}

// ==========================================
// FORM HANDLING
// ==========================================

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

    if (!title || !time) {
        alert(t.alertTitleTime);
        return;
    }
    const selectedDaysElements = document.querySelectorAll('.day-option.selected');
    const selectedIndices = Array.from(selectedDaysElements).map(el => parseInt(el.dataset.day));
    if (selectedIndices.length === 0) {
        alert(t.alertDay);
        return;
    }

    if (editingTaskId) {
        updateExistingTask(editingTaskId, title, selectedIndices[0], time, isPermanent, desc);
    } else {
        saveNewTasks(title, selectedIndices, time, isPermanent, desc);
    }
    modalForm.classList.add('hidden');
    modalView.classList.add('hidden');
});

btnDelete.addEventListener('click', () => {
    if (editingTaskId) deleteTask(editingTaskId);
});

// ==========================================
// MODAL LOGIC
// ==========================================
// Функция обработки свайпа вниз для закрытия
function initModalSwipe(modalOverlay) {
    const card = modalOverlay.querySelector('.modal-card');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // Закрытие по клику на фон (если клик был именно по оверлею, а не по карточке)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });

    // Начало касания
    card.addEventListener('touchstart', (e) => {
        // Если мы не в самом верху прокрутки, не активируем свайп закрытия (чтобы работал скролл контента)
        if (card.scrollTop > 0) return;

        startY = e.touches[0].clientY;
        isDragging = true;
        card.style.transition = 'none'; // Убираем анимацию для прямого следования за пальцем
    }, { passive: true });

    // Движение пальца
    card.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        // Если тянем вниз (diff > 0)
        if (diff > 0) {
            // e.preventDefault(); // Можно включить, если скролл мешает, но с passive:true нельзя
            card.style.transform = `translateY(${diff}px)`;
        }
    }, { passive: true });

    // Конец касания
    card.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)'; // Возвращаем плавность

        const diff = currentY - startY;
        // Если протащили больше 120px вниз -> закрываем
        if (diff > 120 && card.scrollTop <= 0) {
            modalOverlay.classList.add('hidden');
            // Сброс стиля после закрытия
            setTimeout(() => {
                card.style.transform = '';
            }, 300);
        } else {
            // Иначе возвращаем на место
            card.style.transform = '';
        }
    });
}

// ... (Дальше идут стандартные функции открытия модалок openViewModal, openEditModal и т.д.) ...
// Убедитесь, что функции открытия модалок (ниже) используют ваши переменные.

window.openViewModal = function (id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const t = TRANSLATIONS[state.lang];
    viewingTaskId = id;
    vTitle.textContent = task.title;
    const days = t.daysFull;
    vTimeDate.textContent = `${days[task.dayIndex]} • ${task.time}`;
    vDesc.textContent = task.description ? task.description : t.noDesc;

    // Сброс трансформации перед открытием
    const card = modalView.querySelector('.modal-card');
    card.style.transform = '';

    modalView.classList.remove('hidden');
};

btnGoToEdit.addEventListener('click', () => {
    if (viewingTaskId) {
        modalView.classList.add('hidden');
        openEditModal(viewingTaskId);
    }
});

function openEditModal(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const t = TRANSLATIONS[state.lang];
    editingTaskId = id;
    modalTitle.textContent = t.editTask;
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

    const card = modalForm.querySelector('.modal-card');
    card.style.transform = '';

    modalForm.classList.remove('hidden');
}

fabBtn.addEventListener('click', () => {
    const t = TRANSLATIONS[state.lang];
    editingTaskId = null;
    viewingTaskId = null;
    modalTitle.textContent = t.newTask;
    btnDelete.classList.add('hidden');
    taskForm.reset();
    renderModalDaySelector();
    const container = document.getElementById('day-selector');
    const btn = container.querySelector(`.day-option[data-day="${currentDayIndex}"]`);
    if (btn) btn.classList.add('selected');
    dayInput.value = currentDayIndex;
    document.getElementById('t-time').value = '';

    const card = modalForm.querySelector('.modal-card');
    card.style.transform = '';

    modalForm.classList.remove('hidden');
});

closeFormBtn.addEventListener('click', () => modalForm.classList.add('hidden'));
closeViewBtn.addEventListener('click', () => modalView.classList.add('hidden'));

// ==========================================
// UI RENDERING
// ==========================================

function renderHeader() {
    const start = new Date(state.currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const locale = TRANSLATIONS[state.lang].dateFormat;
    const opts = { day: 'numeric', month: 'long' };
    document.getElementById('current-week-dates').textContent =
        `${start.toLocaleDateString(locale, opts)} — ${end.toLocaleDateString(locale, opts)}`;
}

function renderNav() {
    const days = TRANSLATIONS[state.lang].daysShort;
    const currentDayOfWeek = (new Date().getDay() + 6) % 7;
    dayNavTrack.innerHTML = days.map((d, i) => {
        const isToday = (i === currentDayOfWeek);
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
    const currentMonday = new Date(state.currentWeekStart);
    for (let i = 0; i < 7; i++) {
        let dayTasks = state.tasks.filter(t => t.dayIndex === i);
        dayTasks.sort((a, b) => a.time.localeCompare(b.time));
        let dateObj = new Date(currentMonday);
        dateObj.setDate(currentMonday.getDate() + i);
        let dateStr = dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
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
                <div style="display:flex; flex-direction:column; align-items:center; margin-top:60px; opacity:0.4;">
                    <i class="ph-duotone ph-coffee" style="font-size:48px; margin-bottom:10px;"></i>
                    <span style="font-size:14px; font-weight:600;">${TRANSLATIONS[state.lang].noTasks}</span>
                </div>
            `;
        } else {
            dayTasks.forEach(task => {
                const checked = task.isCompleted ? 'checked' : '';
                const completedCls = task.isCompleted ? 'completed' : '';
                const permIcon = task.isPermanent ? `<span class="perm-stripe"></span><i class="ph-bold ph-infinity perm-icon"></i>` : '';

                // Рендер карточки с новой структурой
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

// ==========================================
// TEXT ANALYSIS
// ==========================================

function attachTextAnalyzer(element) {
    if (!element) return;
    element.addEventListener('input', () => {
        const text = element.value;
        detectAndSetLang(element, text);
        if (isGibberish(text)) element.classList.add('input-warning');
        else element.classList.remove('input-warning');
    });
}

function detectAndSetLang(element, text) {
    if (!text) return;
    const cyrillicCount = (text.match(/[а-яА-ЯёЁіІїЇєЄґҐ]/g) || []).length;
    const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (cyrillicCount > latinCount) {
        element.setAttribute('lang', state.lang === 'uk' ? 'uk' : 'ru');
    } else if (latinCount > cyrillicCount) {
        element.setAttribute('lang', 'en');
    }
}

function isGibberish(text) {
    if (!text || text.length < 4) return false;
    const repetitionRegex = /(.)\1{4,}/;
    const patternRepetition = /(.{2,})\1{3,}/;
    const longWordRegex = /\S{25,}/;
    if (repetitionRegex.test(text)) return true;
    if (patternRepetition.test(text)) return true;
    if (longWordRegex.test(text)) return true;
    return false;
}

// ==========================================
// SWIPER
// ==========================================

window.goToDay = function (index) {
    if (index < 0) index = 0;
    if (index > 6) index = 6;
    currentDayIndex = index;
    updateSliderPosition();
    updateNavHighlight();
};

function updateSliderPosition() {
    const translateX = -(currentDayIndex * 100);
    scheduleTrack.style.transform = `translateX(${translateX}%)`;
}

function initSwipe() {
    let startX = 0;
    let endX = 0;
    const viewport = document.getElementById('schedule-viewport');
    viewport.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
        endX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (startX - endX > threshold) goToDay(currentDayIndex + 1);
        else if (endX - startX > threshold) goToDay(currentDayIndex - 1);
    }, { passive: true });
}

// ==========================================
// IOS PICKER (COMPACT)
// ==========================================

const timeInput = document.getElementById('t-time');
const pickerOverlay = document.getElementById('ios-time-picker');
const pickerDoneBtn = document.getElementById('picker-done-btn');
const colHours = document.getElementById('col-hours');
const colMinutes = document.getElementById('col-minutes');
let scrollTimeout;

function initCustomTimePicker() {
    generatePickerItems(colHours, 24);
    generatePickerItems(colMinutes, 60);

    // Настраиваем взаимодействие (Колесико + Мышка)
    setupColumnInteractions(colHours);
    setupColumnInteractions(colMinutes);

    timeInput.addEventListener('click', () => openPicker());
    pickerDoneBtn.addEventListener('click', () => {
        saveTimeFromPicker();
        closePicker();
    });

    pickerOverlay.addEventListener('click', (e) => {
        if (e.target === pickerOverlay) closePicker();
    });

    // Обычный скролл (инерция) тоже обновляет подсветку
    colHours.addEventListener('scroll', () => handleScroll(colHours));
    colMinutes.addEventListener('scroll', () => handleScroll(colMinutes));
}

// --- ГЕНЕРАЦИЯ ЦИФР ---
function generatePickerItems(container, count) {
    container.innerHTML = '';
    // CSS .spacer теперь должен быть (160 - 44) / 2 = 58px
    const topSpacer = document.createElement('div');
    topSpacer.className = 'spacer';
    container.appendChild(topSpacer);

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'picker-item';
        div.textContent = i.toString().padStart(2, '0');
        div.dataset.val = i;
        container.appendChild(div);
    }
    const botSpacer = document.createElement('div');
    botSpacer.className = 'spacer';
    container.appendChild(botSpacer);
}

// --- ЛОГИКА DRAG & DROP И КОЛЕСИКА ---
function setupColumnInteractions(column) {
    const itemHeight = 44; // Высота одного элемента
    let isDown = false;
    let startY;
    let scrollTop;

    // 1. КОЛЕСИКО МЫШИ (Точно по одному элементу)
    column.addEventListener('wheel', (e) => {
        e.preventDefault(); // Останавливаем стандартный быстрый скролл

        // Определяем направление (вверх или вниз)
        const direction = e.deltaY > 0 ? 1 : -1;

        // Скроллим ровно на высоту одного элемента
        column.scrollBy({
            top: direction * itemHeight,
            behavior: 'smooth'
        });
    });

    // 2. НАЖАТИЕ МЫШКИ (Начало перетаскивания)
    column.addEventListener('mousedown', (e) => {
        isDown = true;
        column.classList.add('is-dragging'); // Отключаем CSS-прилипание
        startY = e.pageY - column.offsetTop;
        scrollTop = column.scrollTop;
    });

    // 3. ВЫХОД ЗА ПРЕДЕЛЫ
    column.addEventListener('mouseleave', () => {
        if (isDown) {
            isDown = false;
            column.classList.remove('is-dragging');
            snapToNearest(column); // Доводка при потере фокуса
        }
    });

    // 4. ОТПУСКАНИЕ МЫШКИ
    column.addEventListener('mouseup', () => {
        isDown = false;
        column.classList.remove('is-dragging'); // Включаем CSS-прилипание обратно
        snapToNearest(column); // Доводка к центру
    });

    // 5. ДВИЖЕНИЕ МЫШКИ
    column.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const y = e.pageY - column.offsetTop;
        const walk = (y - startY) * 1.5; // Скорость прокрутки (можно менять)
        column.scrollTop = scrollTop - walk;
    });
}

// Функция "доводки" до ближайшего элемента после перетаскивания мышкой
function snapToNearest(column) {
    const itemHeight = 44;
    const currentScroll = column.scrollTop;
    const targetIndex = Math.round(currentScroll / itemHeight);

    column.scrollTo({
        top: targetIndex * itemHeight,
        behavior: 'smooth'
    });
}

// --- ОТКРЫТИЕ/ЗАКРЫТИЕ ---
function openPicker() {
    let [h, m] = timeInput.value.split(':').map(Number);
    if (isNaN(h)) {
        const now = new Date();
        h = now.getHours();
        m = now.getMinutes();
    }
    pickerOverlay.classList.remove('hidden');
    setTimeout(() => pickerOverlay.classList.add('active'), 10);

    // Ждем отрисовки, чтобы скролл сработал
    setTimeout(() => {
        scrollToValue(colHours, h);
        scrollToValue(colMinutes, m);
    }, 50);
}

function closePicker() {
    pickerOverlay.classList.remove('active');
    setTimeout(() => pickerOverlay.classList.add('hidden'), 300);
}

function scrollToValue(column, value) {
    const itemHeight = 44;
    column.scrollTop = value * itemHeight;
    // highlightItem вызовется сам через событие 'scroll'
}

function handleScroll(column) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => highlightItem(column), 20); // Реакция быстрее (20мс)
}

function highlightItem(column) {
    const itemHeight = 44;
    const scrollPos = column.scrollTop;
    const index = Math.round(scrollPos / itemHeight);

    const items = column.querySelectorAll('.picker-item');
    items.forEach(item => item.classList.remove('selected'));

    // +1 из-за spacer'а в начале
    // Но так как querySelectorAll берет и picker-item, то индекс должен совпадать с данными
    if (items[index]) {
        items[index].classList.add('selected');
    }
}

function saveTimeFromPicker() {
    const itemHeight = 44;
    const hIndex = Math.round(colHours.scrollTop / itemHeight);
    const mIndex = Math.round(colMinutes.scrollTop / itemHeight);

    const h = Math.min(Math.max(0, hIndex), 23);
    const m = Math.min(Math.max(0, mIndex), 59);

    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    timeInput.value = timeString;
    timeInput.dispatchEvent(new Event('input'));
}