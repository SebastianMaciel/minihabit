// Always use static keys for habits
const habits = [
  { id: 'one', name: 'Tomar 2L de agua' },
  { id: 'two', name: 'Leer 15 minutos' },
  { id: 'three', name: 'Caminar 10k' },
];

// Persist habits to localStorage
const loadHabits = () => {
  const data = localStorage.getItem('minihabit-habits');
  return data ? JSON.parse(data) : habits;
};
const saveHabits = (habitsArr) => {
  localStorage.setItem('minihabit-habits', JSON.stringify(habitsArr));
};

const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // lunes

const getFormattedDate = (date) => date.toISOString().split('T')[0];

const loadData = () => {
  const data = localStorage.getItem('minihabit');
  return data ? JSON.parse(data) : {};
};

const saveData = (data) => {
  localStorage.setItem('minihabit', JSON.stringify(data));
};

// Helper to get Monday of current week as string
function getCurrentMondayStr() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// Reset progress if it's a new Monday
function maybeResetProgress() {
  const lastReset = localStorage.getItem('minihabit-last-reset');
  const thisMonday = getCurrentMondayStr();
  if (lastReset !== thisMonday) {
    // Clear all days for all habits
    const habitsArr = loadHabits();
    const cleared = {};
    habitsArr.forEach((h) => {
      cleared[h.id] = [];
    });
    saveData(cleared);
    localStorage.setItem('minihabit-last-reset', thisMonday);
  }
}

maybeResetProgress();

// Change render to a function declaration to avoid reassigning a const
function render() {
  const container = document.getElementById('habit-container');
  container.innerHTML = '';
  const state = loadData();
  const habitsArr = loadHabits();

  habitsArr.forEach((habit, idx) => {
    const habitDiv = document.createElement('div');
    habitDiv.className = 'habit';

    const title = document.createElement('div');
    title.className = 'habit-name';
    title.textContent = habit.name;
    title.tabIndex = 0;
    title.style.cursor = 'pointer';

    // Make label editable on click
    title.addEventListener('click', () => {
      const editWrapper = document.createElement('div');
      editWrapper.className = 'habit-edit-wrapper';
      editWrapper.style.display = 'flex';
      editWrapper.style.alignItems = 'center';
      editWrapper.style.gap = '0.3rem';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = habit.name;
      input.className = 'habit-edit-input';
      input.style.fontSize = '1.1rem';
      input.style.width = '70%';
      input.setAttribute('maxlength', '30');
      input.required = true;
      input.autofocus = true;

      const checkBtn = document.createElement('button');
      checkBtn.innerHTML = '✔️';
      checkBtn.className = 'habit-edit-check';
      checkBtn.style.fontSize = '1.1rem';
      checkBtn.style.cursor = 'pointer';
      checkBtn.title = 'Aceptar';

      editWrapper.appendChild(input);
      editWrapper.appendChild(checkBtn);
      habitDiv.replaceChild(editWrapper, title);
      input.focus();
      input.select();

      const accept = () => {
        const newName = input.value.trim();
        if (newName) {
          habitsArr[idx].name = newName;
          saveHabits(habitsArr);
          render();
        } else {
          input.focus();
        }
      };
      checkBtn.addEventListener('click', accept);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') accept();
      });
      input.addEventListener('blur', () => {
        setTimeout(() => {
          if (document.activeElement !== checkBtn) {
            render();
          }
        }, 100);
      });
    });

    const weekRow = document.createElement('div');
    weekRow.className = 'week';

    let completed = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = getFormattedDate(date);
      const todayStr = getFormattedDate(today);

      const day = document.createElement('div');
      day.className = 'day';
      day.textContent = weekdays[i];

      // Use static id for state
      const isDone = state[habit.id]?.includes(dateStr);
      if (isDone) {
        day.classList.add('done');
        completed++;
      }

      if (dateStr === todayStr) {
        day.classList.add('today');
      }

      day.addEventListener('click', () => {
        const current = loadData();
        current[habit.id] = current[habit.id] || [];
        const idxDate = current[habit.id].indexOf(dateStr);
        if (idxDate >= 0) {
          current[habit.id].splice(idxDate, 1);
          day.classList.remove('done');
        } else {
          current[habit.id].push(dateStr);
          day.classList.add('done');
        }
        saveData(current);
        day.classList.add('pop');
        day.addEventListener('animationend', function handler() {
          day.classList.remove('pop');
          day.removeEventListener('animationend', handler);
          render();
        });
      });

      weekRow.appendChild(day);
    }

    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.textContent = `${completed} / 7 días completados`;

    habitDiv.appendChild(title);
    habitDiv.appendChild(weekRow);
    habitDiv.appendChild(progress);
    container.appendChild(habitDiv);
  });
}

render();

const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
  document.body.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});
