const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const pendingCount = document.getElementById("pendingCount");
const filterButtons = document.querySelectorAll(".filter-btn");

const storageKey = "taskflow-items";
let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  };
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const pending = total - done;

  totalCount.textContent = total;
  doneCount.textContent = done;
  pendingCount.textContent = pending;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";
  emptyState.hidden = tasks.length !== 0 || visibleTasks.length !== 0;

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Tandai ${task.text}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "Hapus";
    removeButton.addEventListener("click", () => removeTask(task.id));

    item.append(checkbox, text, removeButton);
    taskList.append(item);
  });

  updateStats();
}

function addTask(text) {
  tasks = [createTask(text), ...tasks];
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, done: !task.done } : task,
  );

  saveTasks();
  renderTasks();
}

function removeTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = taskInput.value.trim();
  if (!value) {
    taskInput.focus();
    return;
  }

  addTask(value);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderTasks();
  });
});

if (tasks.length === 0) {
  tasks = [
    createTask("Buat daftar prioritas hari ini"),
    createTask("Tandai tugas yang sudah selesai"),
    createTask("Coba filter untuk melihat status tugas"),
  ];
  tasks[0].done = true;
  saveTasks();
}

renderTasks();
