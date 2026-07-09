function makeDraggable(handle, target = handle) {
  if (getComputedStyle(target).position === "static") {
    target.style.position = "relative";
  }

  let offsetX = 0,
    offsetY = 0,
    isDragging = false;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = target.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    target.style.zIndex = Date.now();
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    target.style.left = `${e.clientX - offsetX}px`;
    target.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function createWindow({
  title,
  content,
  x = 100,
  y = 100,
  width = 300,
  height = 200,
}) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = `${x}px`;
  win.style.top = `${y}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;

  win.innerHTML = `
    <div class="window-titlebar">
      <span>${title}</span>
      <div class="window-controls">
        <button aria-label="Minimize">―</button>
        <button aria-label="Maximize">☐</button>
        <button aria-label="Close">✕</button>
      </div>
    </div>
    <div class="window-content">${content}</div>
  `;

  const titleBar = win.querySelector(".window-titlebar");
  makeDraggable(titleBar, win);

  win
    .querySelector('[aria-label="Close"]')
    .addEventListener("click", () => win.remove());

  win.querySelector('[aria-label="Minimize"]').addEventListener("click", () => {
    win.style.display = win.style.display === "none" ? "block" : "none";
  });

  win.querySelector('[aria-label="Maximize"]').addEventListener("click", () => {
    const isMaxed = win.classList.toggle("maximized");
    if (isMaxed) {
      win.style.left = "0";
      win.style.top = "0";
      win.style.width = "100vw";
      win.style.height = "100vh";
    } else {
      win.style.left = `${x}px`;
      win.style.top = `${y}px`;
      win.style.width = `${width}px`;
      win.style.height = `${height}px`;
    }
  });

  document.getElementById("desktop").appendChild(win);
  return win;
}

function startClock() {
  const clockEl = document.createElement("div");
  clockEl.id = "clock";
  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  update();
  setInterval(update, 1000);
  document.getElementById("taskbar").appendChild(clockEl);
}

function openSettings() {
  const bg1 = "red-textile-fabric-texture-background.jpg";
  const bg2 = "red_low_poly_background.jpg";

  const settingsContent = `
  <div style="padding: 10px;">
    <p style="margin-bottom: 15px; font-weight: bold;">Select a background:</p>

    <label style="display: block; margin-bottom: 10px;">
      <input type="radio" name="background" value="${bg1}" checked>
      <span>Wavy (Default)</span>
    </label>

    <label style="display: block; margin-bottom: 15px;">
      <input type="radio" name="background" value="${bg2}">
      <span>Poly</span>
    </label>

    <button id="apply-bg-btn" style="padding: 8px 16px; background: #4a90e2; color: white; border: none; cursor: pointer;">
      Apply Background
    </button>
  </div>
  `;

  const settingsWin = createWindow({
    title: "⚙️ Settings",
    content: settingsContent,
    x: 20,
    y: 20,
    width: 300,
    height: 200,
  });

  settingsWin.querySelector("#apply-bg-btn").addEventListener("click", () => {
    const selected = settingsWin.querySelector(
      'input[name="background"]:checked',
    ).value;
    document.getElementById("desktop").style.backgroundImage =
      `url('${selected}')`;
  });
}

function openNotes() {
  const notesContent =
    '<textarea id="notes-text" style="width:100%;height:100%;border:none;resize:none;padding:8px;" placeholder="Write your notes here..."></textarea>';

  createWindow({
    title: "📝 Notes",
    content: notesContent,
    x: 420,
    y: 80,
    width: 320,
    height: 260,
  });
}

function openTodo() {
  const todoContent = `
    <div style="display: flex; flex-direction: column; height: 100%; gap: 10px;">
      <div style="display: flex; gap: 8px;">
        <input type="text" class="todo-input" placeholder="Add a task..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button class="add-todo-btn" style="padding: 8px 12px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">+</button>
      </div>
      <div class="todo-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;"></div>
    </div>
  `;

  const todoWindow = createWindow({
    title: "📋 To-Do",
    content: todoContent,
    x: 650,
    y: 80,
    width: 300,
    height: 350,
  });

  const input = todoWindow.querySelector(".todo-input");
  const addBtn = todoWindow.querySelector(".add-todo-btn");
  const todoList = todoWindow.querySelector(".todo-list");

  addBtn.addEventListener("click", addTodo);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  function addTodo() {
    const text = input.value.trim();
    if (!text) return;

    const todoItem = document.createElement("div");
    todoItem.style.cssText =
      "background: #f0f0f0; padding: 10px; border-radius: 4px; border-left: 3px solid #4a90e2; display: flex; justify-content: space-between; align-items: center;";
    todoItem.innerHTML = `
      <span>${text}</span>
      <button style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: 16px; padding: 0;">✕</button>
    `;

    todoItem.querySelector("button").addEventListener("click", () => {
      todoItem.remove();
    });

    todoList.insertBefore(todoItem, todoList.firstChild);
    input.value = "";
    input.focus();
  }
}

function createAppLauncher() {
  const appLauncher = document.createElement("div");
  appLauncher.id = "app-launcher";
  appLauncher.innerHTML = `
    <button class="app-btn" data-app="notes" title="Notes">📝</button>
    <button class="app-btn" data-app="todo" title="To-Do">📋</button>
    <button class="app-btn" data-app="settings" title="Settings">⚙️</button>
  `;

  appLauncher
    .querySelector('[data-app="notes"]')
    .addEventListener("click", openNotes);
  appLauncher
    .querySelector('[data-app="todo"]')
    .addEventListener("click", openTodo);
  appLauncher
    .querySelector('[data-app="settings"]')
    .addEventListener("click", openSettings);

  document.getElementById("desktop").appendChild(appLauncher);
}

function boot() {
  const taskbar = document.createElement("div");
  taskbar.id = "taskbar";
  taskbar.innerHTML = "<span>🍅 KetchupOS</span>";
  document.getElementById("desktop").appendChild(taskbar);

  startClock();
  createAppLauncher();
  openNotes();
  openTodo();

  createWindow({
    title: "Welcome!",
    content: `<p>Welcome to KetchupOS! Click the app icons on the left to open more windows.</p>`,
  });

  createWindow({
    title: "Ketchup Ad",
    content: `<div style="background-image: url('images.jpg'); background-size: cover; width: 100%; height: 200px;"></div>`,
    x: 850,
    y: 200,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
