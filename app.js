// TodoMVC App State
let appState = {
  todos: [],
  filter: 'all',
  editingId: null,
  newTodoText: ''
};

let nextId = 1;

// Helper functions
function generateId() {
  return nextId++;
}

function pluralize(count, word) {
  return count === 1 ? word : word + 's';
}

function getFilteredTodos() {
  switch (appState.filter) {
    case 'active':
      return appState.todos.filter(todo => !todo.completed);
    case 'completed':
      return appState.todos.filter(todo => todo.completed);
    default:
      return appState.todos;
  }
}

function updateUI() {
  const todos = appState.todos;
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const filteredTodos = getFilteredTodos();

  // Update main section visibility
  const mainSection = document.getElementById('main');
  const footerSection = document.getElementById('footer');

  if (todos.length === 0) {
    mainSection.style.display = 'none';
    footerSection.style.display = 'none';
  } else {
    mainSection.style.display = 'block';
    footerSection.style.display = 'block';
  }

  // Update toggle all checkbox
  const toggleAll = document.getElementById('toggle-all');
  toggleAll.checked = activeTodos.length === 0 && todos.length > 0;

  // Update todo list
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';
    if (appState.editingId === todo.id) {
      li.className += ' editing';
    }

    li.innerHTML = `
            <div class="view">
                <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''} data-onclick="toggleTodo" data-id="${todo.id}">
                <label data-ondblclick="editTodo" data-id="${todo.id}">${todo.text}</label>
                <button class="destroy" data-onclick="removeTodo" data-id="${todo.id}"></button>
            </div>
            <input class="edit" value="${todo.text}" data-onkeydown="saveEdit" data-id="${todo.id}">
        `;

    todoList.appendChild(li);
  });

  // Update todo count
  const todoCount = document.getElementById('todo-count');
  const activeCount = activeTodos.length;
  todoCount.innerHTML = `<strong>${activeCount}</strong> ${pluralize(activeCount, 'item')} left`;

  // Update clear completed button
  const clearCompleted = document.querySelector('.clear-completed');
  if (completedTodos.length > 0) {
    clearCompleted.style.display = 'block';
    clearCompleted.textContent = `Clear completed (${completedTodos.length})`;
  } else {
    clearCompleted.style.display = 'none';
  }

  // Update filter links
  document.querySelectorAll('.filters a').forEach(link => {
    link.classList.remove('selected');
    const filter = link.getAttribute('data-filter');
    if (filter === appState.filter) {
      link.classList.add('selected');
    }
  });
}

// Event handlers
eventRegistry.register('keydown', 'addTodo', function (event) {
  if (event.key === 'Enter') {
    const input = event.target;
    const text = input.value.trim();
    if (text) {
      appState.todos.push({
        id: generateId(),
        text: text,
        completed: false
      });
      input.value = '';
      updateUI();
    }
  }
});

eventRegistry.register('click', 'toggleAll', function (event) {
  const checked = event.target.checked;
  appState.todos.forEach(todo => {
    todo.completed = checked;
  });
  updateUI();
});

eventRegistry.register('click', 'toggleTodo', function (event) {
  const id = parseInt(event.target.getAttribute('data-id'));
  const todo = appState.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    updateUI();
  }
});

eventRegistry.register('click', 'removeTodo', function (event) {
  const id = parseInt(event.target.getAttribute('data-id'));
  appState.todos = appState.todos.filter(t => t.id !== id);
  updateUI();
});

eventRegistry.register('dblclick', 'editTodo', function (event) {
  const id = parseInt(event.target.getAttribute('data-id'));
  appState.editingId = id;
  updateUI();

  // Focus the edit input
  setTimeout(() => {
    const editInput = document.querySelector('.editing .edit');
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }, 0);
});

eventRegistry.register('keydown', 'saveEdit', function (event) {
  const id = parseInt(event.target.getAttribute('data-id'));
  const input = event.target;

  if (event.key === 'Enter') {
    const text = input.value.trim();
    if (text) {
      const todo = appState.todos.find(t => t.id === id);
      if (todo) {
        todo.text = text;
      }
    } else {
      appState.todos = appState.todos.filter(t => t.id !== id);
    }
    appState.editingId = null;
    updateUI();
  } else if (event.key === 'Escape') {
    appState.editingId = null;
    updateUI();
  }
});

eventRegistry.register('click', 'setFilter', function (event) {
  event.preventDefault();
  const filter = event.target.getAttribute('data-filter');
  appState.filter = filter;
  updateUI();
});

eventRegistry.register('click', 'clearCompleted', function (event) {
  appState.todos = appState.todos.filter(todo => !todo.completed);
  updateUI();
});

// Router setup
const routes = {
  '/': () => {
    appState.filter = 'all';
    updateUI();
  },
  '/active': () => {
    appState.filter = 'active';
    updateUI();
  },
  '/completed': () => {
    appState.filter = 'completed';
    updateUI();
  },'/404': () => {
        const container = document.getElementById('app');
        container.innerHTML = `
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>`
  }
};

const router = new Router(routes);

// Initialize the app
updateUI();