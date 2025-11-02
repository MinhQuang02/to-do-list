let todos = [];
let editingId = null;
let deleteTarget = null;

const todoListEl = document.getElementById('todo-list');
const popup = document.getElementById('section-popup');
const openAddBtn = document.getElementById('open-add');
const floatingAddBtn = document.getElementById('floating-add');
const cancelBtn = document.getElementById('cancel-btn');
const applyBtn = document.getElementById('apply-btn');
const noteInput = document.getElementById('note-input');
const prioritySelect = document.getElementById('priority-select');
const modalTitle = document.getElementById('modal-title');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');
const deleteModal = document.getElementById('delete-modal');
const deleteCancel = document.getElementById('delete-cancel');
const deleteConfirm = document.getElementById('delete-confirm');

/* Toast */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* API Calls */
async function loadTodos() {
  try {
    const res = await fetch('/api/todos');
    todos = await res.json();
    renderTodos();
  } catch (err) {
    showToast('Failed to load todos');
  }
}

async function addTodo(text, priority = 'normal') {
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), priority })
    });
    const newTodo = await res.json();
    todos.unshift(newTodo);
    renderTodos();
  } catch (err) {
    showToast('Failed to add todo');
  }
}

async function updateTodo(id, newData) {
  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
    const updated = await res.json();
    const i = todos.findIndex(t => t.id === id);
    if (i !== -1) todos[i] = updated;
    renderTodos();
  } catch (err) {
    showToast('Failed to update todo');
  }
}

async function deleteTodo(id) {
  try {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    todos = todos.filter(t => t.id !== id);
    renderTodos();
  } catch (err) {
    showToast('Failed to delete todo');
  }
}

async function toggleDone(id) {
  const t = todos.find(x => x.id === id);
  if (t) await updateTodo(id, { done: !t.done });
}

/* Modal */
function openModal(mode, id = null) {
  popup.classList.remove('hidden');
  popup.classList.add('flex');
  if (mode === 'edit') {
    modalTitle.textContent = 'Edit Task';
    editingId = id;
    const t = todos.find(x => x.id === id);
    noteInput.value = t ? t.text : '';
    prioritySelect.value = t ? t.priority : 'normal';
  } else {
    modalTitle.textContent = 'New Task';
    editingId = null;
    noteInput.value = '';
    prioritySelect.value = 'normal';
  }
  noteInput.focus();
}

function closeModal() {
  popup.classList.add('hidden');
  popup.classList.remove('flex');
  editingId = null;
}

/* Delete Modal */
function openDeleteModal(id) {
  deleteTarget = id;
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deleteModal.classList.remove('flex');
  deleteTarget = null;
}

/* Render */
function renderTodos() {
  const search = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  todoListEl.innerHTML = '';

  const filtered = todos.filter(t => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'completed' && !t.done) return false;
    if (search && !t.text.toLowerCase().includes(search)) return false;
    return true;
  });

  if (filtered.length === 0) {
    todoListEl.innerHTML = `
      <div class="py-8 text-center flex flex-col items-center gap-3">
        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076503.png"
            alt="No tasks found"
            class="w-[180px] opacity-70"/>
        <p class="text-sm text-[var(--muted)]">No tasks found</p>
      </div>`;
    return;
  }

  for (const t of filtered) {
    const item = document.createElement('div');
    item.className = 'flex items-center gap-4 py-4 px-2 transition hover:bg-[var(--input-bg)]/40 rounded-lg';

    const box = document.createElement('button');
    box.className = 'w-[26px] h-[26px] rounded-sm flex-shrink-0 border border-primary flex items-center justify-center';
    if (t.done) {
      box.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      box.style.background = 'var(--primary)';
    }
    box.addEventListener('click', () => toggleDone(t.id));
    item.appendChild(box);

    const content = document.createElement('div');
    content.className = 'flex-grow';
    const title = document.createElement('p');
    title.textContent = t.text;
    title.className = 'font-medium text-lg';
    if (t.done) { title.style.textDecoration = 'line-through'; title.style.opacity = '0.6'; }
    content.appendChild(title);

    const priority = document.createElement('span');
    priority.textContent = 
      t.priority === 'high' ? 'High priority' :
      t.priority === 'low' ? 'Low priority' : 'Normal priority';
    priority.className = 'text-sm text-[var(--muted)]';
    content.appendChild(priority);

    item.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-3';
    const editBtn = document.createElement('button');
    editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 3.5l4 4L8 20l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.5"/></svg>`;
    editBtn.addEventListener('click', () => openModal('edit', t.id));

    const delBtn = document.createElement('button');
    delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.5"/></svg>`;
    delBtn.addEventListener('click', () => openDeleteModal(t.id));

    actions.append(editBtn, delBtn);
    item.appendChild(actions);
    todoListEl.appendChild(item);
  }
}

/* Debounce for search */
function debounce(fn, delay=400){
  let t;
  return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }
}

/* Events */
openAddBtn.addEventListener('click', () => openModal('new'));
floatingAddBtn.addEventListener('click', () => openModal('new'));
cancelBtn.addEventListener('click', closeModal);
applyBtn.addEventListener('click', async () => {
  const text = noteInput.value.trim();
  const priority = prioritySelect.value;
  if (!text) return showToast('Please enter a task name.');
  if (editingId) await updateTodo(editingId, { text, priority });
  else await addTodo(text, priority);
  closeModal();
});
searchInput.addEventListener('input', debounce(renderTodos));
filterSelect.addEventListener('change', renderTodos);

/* Delete Modal */
deleteCancel.addEventListener('click', closeDeleteModal);
deleteConfirm.addEventListener('click', async () => {
  if (deleteTarget) await deleteTodo(deleteTarget);
  closeDeleteModal();
});

/* Theme toggle */
const root = document.documentElement;
function setDarkMode(on) {
  if (on) root.classList.add('dark-theme');
  else root.classList.remove('dark-theme');
  localStorage.setItem('theme_dark', on ? '1' : '0');
}
themeToggle.addEventListener('click', () => {
  const isDark = root.classList.contains('dark-theme');
  setDarkMode(!isDark);
});
(function initTheme() {
  const saved = localStorage.getItem('theme_dark');
  if (saved === '1') setDarkMode(true);
})();

/* Responsive floating button */
function updateFloatingBtn() {
  if (window.innerWidth < 640) floatingAddBtn.classList.remove('hidden');
  else floatingAddBtn.classList.add('hidden');
}
window.addEventListener('resize', updateFloatingBtn);

/* Init */
loadTodos();
updateFloatingBtn();

