function Draggable(handle, target = handle) {
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

// Window
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
  Draggable(titleBar, win);

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

// Clock
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

// Settings
function openSettings() {
  const bg1 = "red-textile-fabric-texture-background.jpg";
  const bg2 = "red_low_poly_background.jpg";

  const settingsContent = `
    <div style="padding: 10px;">
      <p style="margin-bottom: 15px; font-weight: bold;">Select a background:</p>
      <label style="display: block; margin-bottom: 10px;">
        <input type="radio" name="background" value="${bg1}" />
        <span>Wavy (Default)</span>
      </label>
      <label style="display: block; margin-bottom: 15px;">
        <input type="radio" name="background" value="${bg2}" />
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
    );
    if (!selected) return;
    document.getElementById("desktop").style.backgroundImage =
      `url('${selected.value}')`;
  });
}

// Notes
let notesWindow = null;

function openNotes() {
  if (notesWindow && document.body.contains(notesWindow)) {
    notesWindow.style.zIndex = Date.now();
    return;
  }

  const notesContent =
    '<textarea id="notes-text" style="width:100%;height:100%;border:none;resize:none;" placeholder="Write your notes here..."></textarea>';

  notesWindow = createWindow({
    title: "Notes",
    content: notesContent,
    x: 420,
    y: 80,
    width: 320,
    height: 260,
  });
}

// App Launcher
function createAppLauncher() {
  const appLauncher = document.createElement("div");
  appLauncher.id = "app-launcher";
  appLauncher.innerHTML = `
    <button id="open-notes-btn">Notes📝</button>
    <button id="open-settings-btn">Settings⚙️</button>
  `;

  appLauncher
    .querySelector("#open-settings-btn")
    .addEventListener("click", openSettings);
  appLauncher
    .querySelector("#open-notes-btn")
    .addEventListener("click", openNotes);

  document.getElementById("desktop").appendChild(appLauncher);
}

// Todo Bar
function TodoBar() {
  const todoBar = document.createElement("div");
  todoBar.id = "todo-bar";
  todoBar.innerHTML = `
    <div id="todo-header">📋 To-Do</div>
    <div id="todo-input-container">
      <input type="text" id="todo-input" placeholder="Add a new task..." />
      <button id="add-todo-btn">➕</button>
    </div>
    <ul id="todo-list"></ul>
  `;
  document.getElementById("desktop").appendChild(todoBar);

  document.getElementById("add-todo-btn").addEventListener("click", () => {
    const input = document.getElementById("todo-input");
    const text = input.value.trim();
    if (!text) return;

    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `<span>${text}</span><button class="todo-delete"></button>`;
    li.querySelector(".todo-delete").addEventListener("click", () =>
      li.remove(),
    );
    document.getElementById("todo-list").appendChild(li);
    input.value = "";
  });

  // also allow pressing Enter to add a task
  document.getElementById("todo-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("add-todo-btn").click();
  });
}

// Boot
function boot() {
  const taskbar = document.createElement("div");
  taskbar.id = "taskbar";
  taskbar.innerHTML = "<span>🍅 KetchupOS</span>";
  document.getElementById("desktop").appendChild(taskbar);

  startClock();
  createAppLauncher();
  TodoBar();
  openNotes();

  createWindow({
    title: "Welcome!",
    content: `<p>Welcome to 🍅 KetchupOS!</p>`,
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
