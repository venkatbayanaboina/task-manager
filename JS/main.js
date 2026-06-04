/* ================================================================
   JS/main.js — Just Do It
   Features: themes · priorities · filters · drag-drop · edit · clear
   Data model: [{id, text, completed, priority}]  stored in localStorage
   ================================================================ */

/* ── SVG icon strings (no CDN icon font needed) ── */
const ICON_CHECK = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;

const ICON_TRASH = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
</svg>`;

/* ── DOM refs ── */
const toDoForm    = document.getElementById('todo-form');
const toDoInput   = document.getElementById('todo-input');
const toDoList    = document.getElementById('todo-list');
const progressBar = document.getElementById('progress-bar');
const progText    = document.getElementById('progress-text');
const emptyState  = document.getElementById('empty-state');
const emptyMsg    = document.getElementById('empty-msg');
const themeBtns   = document.querySelectorAll('.theme-btn');
const priBtns     = document.querySelectorAll('.pri-btn');
const filterBtns  = document.querySelectorAll('.filter-btn');
const clearBtn    = document.getElementById('clear-btn');
const sortBtn     = document.getElementById('sort-btn');
const badgeAll    = document.getElementById('badge-all');
const badgeActive = document.getElementById('badge-active');
const badgeDone   = document.getElementById('badge-done');

/* ── State ── */
let activePriority = 'med';   // default priority for new tasks
let activeFilter   = 'all';   // current filter tab

/* ================================================================
   INIT
   ================================================================ */
// Apply saved theme (or default)
applyTheme(localStorage.getItem('savedTheme') || 'standard');

// Load saved tasks when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadAll();
  applyFilter();
});

/* ================================================================
   EVENTS
   ================================================================ */
toDoForm.addEventListener('submit', addToDo);
toDoList.addEventListener('click',   handleListClick);
toDoList.addEventListener('dblclick', handleEdit);

// Theme switcher
themeBtns.forEach(btn =>
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme))
);

// Priority selector
priBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    activePriority = btn.dataset.pri;
    priBtns.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
  })
);

// Filter tabs
filterBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    filterBtns.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });
    applyFilter();
  })
);

// Clear completed
clearBtn.addEventListener('click', clearCompleted);

// Sort by priority
sortBtn.addEventListener('click', sortByPriority);

/* ================================================================
   THEME
   ================================================================ */
function applyTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('savedTheme', theme);
  themeBtns.forEach(btn =>
    btn.classList.toggle('active', btn.dataset.theme === theme)
  );
}

/* ================================================================
   ADD TASK
   ================================================================ */
function addToDo(e) {
  e.preventDefault();
  const text = toDoInput.value.trim();

  if (!text) {
    toDoInput.classList.add('shake');
    toDoInput.addEventListener('animationend',
      () => toDoInput.classList.remove('shake'), { once: true }
    );
    return;
  }

  const todo = { id: Date.now(), text, completed: false, priority: activePriority };
  renderTodo(todo);
  saveTodo(todo);
  updateUI();

  toDoInput.value = '';
  toDoInput.focus();
}

/* ================================================================
   RENDER SINGLE TASK
   ================================================================ */
function renderTodo(todo) {
  const li = document.createElement('li');
  li.classList.add('todo');
  if (todo.completed) li.classList.add('completed');
  li.dataset.id       = todo.id;
  li.dataset.priority = todo.priority || 'med';
  li.draggable        = true;

  const span = document.createElement('span');
  span.classList.add('todo-item');
  span.textContent = todo.text;
  span.title = 'Double-click to edit';

  const checkBtn = document.createElement('button');
  checkBtn.classList.add('check-btn');
  checkBtn.innerHTML = ICON_CHECK;
  checkBtn.setAttribute('aria-label', 'Mark complete');

  const delBtn = document.createElement('button');
  delBtn.classList.add('delete-btn');
  delBtn.innerHTML = ICON_TRASH;
  delBtn.setAttribute('aria-label', 'Delete task');

  li.append(span, checkBtn, delBtn);

  // Drag & drop
  li.addEventListener('dragstart', onDragStart);
  li.addEventListener('dragend',   onDragEnd);
  li.addEventListener('dragover',  onDragOver);
  li.addEventListener('drop',      onDrop);
  li.addEventListener('dragleave', onDragLeave);

  toDoList.appendChild(li);
  toggleEmptyState();
}

/* ================================================================
   CLICK  (check / delete)
   ================================================================ */
function handleListClick(e) {
  const checkBtn = e.target.closest('.check-btn');
  const delBtn   = e.target.closest('.delete-btn');

  if (checkBtn) {
    const li   = checkBtn.closest('.todo');
    li.classList.toggle('completed');
    const done = li.classList.contains('completed');
    updateCompletedInStorage(Number(li.dataset.id), done);
    updateUI();
    applyFilter();
  }

  if (delBtn) {
    const li = delBtn.closest('.todo');
    li.classList.add('fall');
    removeFromStorage(Number(li.dataset.id));
    li.addEventListener('transitionend', () => {
      li.remove();
      updateUI();
      applyFilter();
      toggleEmptyState();
    }, { once: true });
  }
}

/* ================================================================
   DOUBLE-CLICK EDIT
   ================================================================ */
function handleEdit(e) {
  const span = e.target.closest('.todo-item');
  if (!span) return;

  const li      = span.closest('.todo');
  const id      = Number(li.dataset.id);
  const oldText = span.textContent;

  span.contentEditable = 'true';
  span.focus();

  // Select all text
  const range = document.createRange();
  range.selectNodeContents(span);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function commit() {
    span.contentEditable = 'false';
    const newText = span.textContent.trim();
    if (!newText) { span.textContent = oldText; return; }
    span.textContent = newText;
    updateTextInStorage(id, newText);
  }

  span.addEventListener('blur', commit, { once: true });
  span.addEventListener('keydown', function handler(e) {
    if (e.key === 'Enter')  { e.preventDefault(); span.blur(); }
    if (e.key === 'Escape') {
      span.textContent = oldText;
      span.removeEventListener('keydown', handler);
      span.blur();
    }
  });
}

/* ================================================================
   FILTER
   ================================================================ */
function applyFilter() {
  const all       = [...toDoList.querySelectorAll('.todo')];
  const emptyMsgs = {
    all:    'All clear! Add a task above.',
    active: 'No active tasks — you\'re all caught up! 🎉',
    done:   'Nothing completed yet. Keep going!'
  };

  all.forEach(li => {
    const isCompleted = li.classList.contains('completed');
    let show = true;
    if (activeFilter === 'active' && isCompleted)  show = false;
    if (activeFilter === 'done'   && !isCompleted) show = false;
    li.classList.toggle('hidden-by-filter', !show);
  });

  const visible = all.filter(li => !li.classList.contains('hidden-by-filter'));
  emptyMsg.textContent = emptyMsgs[activeFilter];

  // Show empty state only if no visible tasks
  const hasTodos     = toDoList.children.length > 0;
  const hasVisible   = visible.length > 0;
  emptyState.classList.toggle('hidden', hasTodos && hasVisible);
  if (!hasTodos) emptyMsg.textContent = emptyMsgs.all;
}

/* ================================================================
   CLEAR COMPLETED
   ================================================================ */
function clearCompleted() {
  const done = [...toDoList.querySelectorAll('.todo.completed')];
  if (!done.length) return;

  done.forEach(li => {
    li.classList.add('fall');
    removeFromStorage(Number(li.dataset.id));
    li.addEventListener('transitionend', () => {
      li.remove();
      updateUI();
      applyFilter();
      toggleEmptyState();
    }, { once: true });
  });
}

/* ================================================================
   SORT BY PRIORITY
   ================================================================ */
const PRI_ORDER = { high: 0, med: 1, low: 2 };

function sortByPriority() {
  const items = [...toDoList.querySelectorAll('.todo')];
  items.sort((a, b) => {
    // Use ?? not || because PRI_ORDER['high'] = 0 which is falsy
    // 0 || 1 = 1 (wrong)  vs  0 ?? 1 = 0 (correct)
    const aVal = PRI_ORDER[a.dataset.priority] ?? 1;
    const bVal = PRI_ORDER[b.dataset.priority] ?? 1;
    return aVal - bVal;
  });
  items.forEach(li => toDoList.appendChild(li));
  persistCurrentOrder();
}

/* ================================================================
   DRAG & DROP REORDER
   ================================================================ */
let dragEl = null;

function onDragStart(e) {
  dragEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el =>
    el.classList.remove('drag-over')
  );
  dragEl = null;
  persistCurrentOrder();
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this === dragEl) return;
  const rect  = this.getBoundingClientRect();
  const midY  = rect.top + rect.height / 2;
  if (e.clientY < midY) {
    toDoList.insertBefore(dragEl, this);
  } else {
    toDoList.insertBefore(dragEl, this.nextSibling);
  }
}

function onDrop(e) {
  e.preventDefault();
}

function onDragLeave() {
  this.classList.remove('drag-over');
}

/* ================================================================
   LOCAL STORAGE HELPERS
   ================================================================ */
function getTodos() {
  return JSON.parse(localStorage.getItem('todos')) || [];
}

function saveTodo(todo) {
  const todos = getTodos();
  todos.push(todo);
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadAll() {
  getTodos().forEach(todo => renderTodo(todo));
  updateUI();
}

function removeFromStorage(id) {
  localStorage.setItem('todos',
    JSON.stringify(getTodos().filter(t => t.id !== id))
  );
}

function updateCompletedInStorage(id, completed) {
  localStorage.setItem('todos',
    JSON.stringify(getTodos().map(t => t.id === id ? { ...t, completed } : t))
  );
}

function updateTextInStorage(id, text) {
  localStorage.setItem('todos',
    JSON.stringify(getTodos().map(t => t.id === id ? { ...t, text } : t))
  );
}

// Re-save all tasks in current DOM order (for drag & sort persistence)
function persistCurrentOrder() {
  const ordered = [...toDoList.querySelectorAll('.todo')].map(li => ({
    id:        Number(li.dataset.id),
    text:      li.querySelector('.todo-item').textContent,
    completed: li.classList.contains('completed'),
    priority:  li.dataset.priority
  }));
  localStorage.setItem('todos', JSON.stringify(ordered));
}

/* ================================================================
   UI HELPERS
   ================================================================ */
function updateUI() {
  const all     = [...toDoList.querySelectorAll('.todo')];
  const done    = all.filter(li => li.classList.contains('completed'));
  const total   = all.length;
  const doneN   = done.length;
  const activeN = total - doneN;
  const pct     = total ? (doneN / total) * 100 : 0;

  progressBar.style.width  = `${pct}%`;
  progText.textContent     = `${doneN} / ${total} done`;
  badgeAll.textContent     = total;
  badgeActive.textContent  = activeN;
  badgeDone.textContent    = doneN;

  // Browser tab: show pending count
  document.title = activeN > 0 ? `(${activeN}) Just Do It` : 'Just Do It';
}

function toggleEmptyState() {
  emptyState.classList.toggle('hidden', toDoList.children.length > 0);
}