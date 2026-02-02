// --- КОНФИГУРАЦИЯ И ДАННЫЕ ---

const STORAGE_KEY = 'weekly_planner_data';

// Структура данных (State)
let state = {
    currentWeekStart: null, // Timestamp понедельника текущей недели
    tasks: [] // Массив задач
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДАТЫ ---

// Получить понедельник текущей недели (сброс времени в 00:00)
function getMonday(d) {
    d = new Date(d);
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    let monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// Форматирование даты для хранения (YYYY-MM-DD)
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// --- ЛОГИКА ПРИЛОЖЕНИЯ ---

function initApp() {
    loadData();
    checkWeekUpdate();
    renderHeader(); // Пока только заголовок с датами
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        state = JSON.parse(raw);
    } else {
        // Первичная инициализация
        state.currentWeekStart = getMonday(new Date()).getTime();
        state.tasks = [];
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Главная логика: Проверка и обновление недели
function checkWeekUpdate() {
    const todayMonday = getMonday(new Date()).getTime();
    const storedMonday = state.currentWeekStart;

    // Если наступила новая неделя (хранимая дата меньше текущего понедельника)
    if (todayMonday > storedMonday) {
        console.log("Обнаружена новая неделя. Выполняется перенос...");
        migrateTasksToNewWeek(todayMonday);
    }
}

function migrateTasksToNewWeek(newMondayTimestamp) {
    const newTasks = [];
    const newMondayDate = new Date(newMondayTimestamp);

    state.tasks.forEach(task => {
        if (task.isPermanent) {
            // Клонируем постоянную задачу
            let migratedTask = { ...task };

            // Сбрасываем статус
            migratedTask.isCompleted = false;

            // Вычисляем новую конкретную дату для этой недели
            // task.dayIndex: 0 (Пн) - 6 (Вс)
            let nextDate = new Date(newMondayDate);
            nextDate.setDate(newMondayDate.getDate() + migratedTask.dayIndex);

            migratedTask.date = formatDateKey(nextDate);

            newTasks.push(migratedTask);
        }
        // Непостоянные задачи просто игнорируем (они удаляются)
    });

    // Обновляем стейт
    state.tasks = newTasks;
    state.currentWeekStart = newMondayTimestamp;
    saveData();
    console.log("Перенос завершен. Постоянные задачи обновлены.");
}

// Функция добавления задачи (для будущего использования)
function addTask(title, dayIndex, time, isPermanent) {
    const currentMonday = new Date(state.currentWeekStart);
    let taskDate = new Date(currentMonday);
    taskDate.setDate(currentMonday.getDate() + dayIndex);

    const newTask = {
        id: Date.now().toString(), // Простой ID
        title: title,
        dayIndex: dayIndex, // 0 - Понедельник
        time: time, // Строка "14:00"
        date: formatDateKey(taskDate), // "2023-10-27"
        isCompleted: false,
        isPermanent: isPermanent,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(newTask);
    saveData();
}

// --- ОТРИСОВКА (ПОКА МИНИМАЛЬНАЯ) ---

function renderHeader() {
    const start = new Date(state.currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const options = { day: 'numeric', month: 'long' };
    const text = `${start.toLocaleDateString('ru-RU', options)} — ${end.toLocaleDateString('ru-RU', options)}`;

    document.getElementById('current-week-dates').textContent = text;
}

// Запуск
document.addEventListener('DOMContentLoaded', initApp);