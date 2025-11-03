// --- 1. Imports ---
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // We'll run on port 3000

// --- 2. Middleware ---
// This parses incoming JSON from the body of POST/PUT requests
app.use(express.json());
// This serves all static files (like index.html, app.js) from the current folder
app.use(express.static(path.join(__dirname, '/views/')));

// --- 3. In-Memory "Database" (as requested) ---
let todos = [
  { id: 'id-1', text: 'Learn Express.js', done: false, priority: 'normal' },
  { id: 'id-2', text: 'Build the API', done: true, priority: 'low' },
];
// Simple ID generator
const id = () => 'id-' + Math.random().toString(36).slice(2, 9);


// --- 4. API Routes (The "Contract") ---

// GET /api/todos
// (Called by loadTodos)
app.get('/api/todos', (req, res) => {
  console.log('GET: /api/todos');
  res.json(todos);
});

// POST /api/todos
// (Called by addTodo)
app.post('/api/todos', (req, res) => {
  const { text, priority } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const newTodo = {
    id: id(),
    text: text,
    done: false,
    priority: priority || 'normal'
  };
  
  todos.unshift(newTodo); // Add to the beginning of the array
  console.log('POST: /api/todos - Added:', newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id
// (Called by updateTodo and toggleDone)
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const newData = req.body; // { text, priority } or { done }
  
  const i = todos.findIndex(t => t.id === id);
  
  if (i === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  // Merge new data with old data
  todos[i] = { ...todos[i], ...newData };
  
  console.log('PUT: /api/todos/' + id + ' - Updated:', todos[i]);
  res.json(todos[i]);
});

// DELETE /api/todos/:id
// (Called by deleteTodo)
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  
  todos = todos.filter(t => t.id !== id);
  
  console.log('DELETE: /api/todos/' + id);
  res.status(204).send(); // "No Content" - signals success
});


// --- 5. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});