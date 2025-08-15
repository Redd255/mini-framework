import { EventRegistry  } from './framework/eventhandler.js';
import { VDOMManager  } from './framework/VDOMmanager.js';
import { VNode } from './framework/vdom.js';
import { Router} from './framework/router.js'
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const eventRegistry = new EventRegistry();
eventRegistry.init();

function App(state, setState) {
  const { todos, filter, input, editingId, editText } = state;

  const filtered = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTodoCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeTodoCount;
  const allCompleted = todos.length > 0 && activeTodoCount === 0;

  // Create unique IDs for event handlers
  const inputKeyDownId = "keydown_" + Date.now();
  const inputOnInputId = "input_" + Date.now();
  const toggleAllId = "toggle_all_" + Date.now();

  eventRegistry.register("keydown", inputKeyDownId, (e) => {
    if (e.keyCode === ENTER_KEY && input.trim()) {
      const newTodo = {
        id: Date.now(),
        title: input.trim(),
        completed: false,
      };
      setState({ todos: [...todos, newTodo], input: "" });
    }
  });

  eventRegistry.register("input", inputOnInputId, (e) => {
    if (checkLen(e.target.value)){
      setState({ input: e.target.value });
    }
  });

  eventRegistry.register("change", toggleAllId, (e) => {
    const shouldComplete = !allCompleted;
    const newTodos = todos.map((todo) => ({
      ...todo,
      completed: shouldComplete,
    }));
    setState({ todos: newTodos });
  });

  return new VNode(
    "section",
    { class: "todoapp" },
    [
      new VNode("header", { class: "header" }, [
        new VNode("h1", {}, ["todos"]),
        new VNode("input", {
          class: "new-todo",
          placeholder: "What needs to be done?",
          autofocus: "true",
          value: input,
          "data-onkeydown": inputKeyDownId,
          "data-oninput": inputOnInputId,
        }),
      ]),

      todos.length > 0
        ? new VNode("section", { class: "main" }, [
            new VNode("input", {
              id: "toggle-all",
              class: "toggle-all",
              type: "checkbox",
              checked: allCompleted,
              "data-onchange": toggleAllId,
            }),
            new VNode("label", { for: "toggle-all" }, ["Mark all as complete"]),
            new VNode(
              "ul",
              { class: "todo-list" },
              filtered.map((todo) => {
                const toggleId = "toggle_" + todo.id;
                const destroyId = "destroy_" + todo.id;
                const labelDoubleClickId = "label_dblclick_" + todo.id;
                const editKeyDownId = "edit_keydown_" + todo.id;
                const editInputId = "edit_input_" + todo.id;

                const isEditing = editingId === todo.id;

                eventRegistry.register("click", destroyId, (e) => {
                  e.stopPropagation();
                  const newTodos = todos.filter((t) => t.id !== todo.id);
                  setState({ todos: newTodos });
                });

                eventRegistry.register("change", toggleId, (e) => {
                  const newTodos = todos.map((t) =>
                    t.id === todo.id ? { ...t, completed: !t.completed } : t
                  );
                  setState({ todos: newTodos });
                });

                // Double click to edit
                eventRegistry.register("dblclick", labelDoubleClickId, (e) => {
                  setState({ 
                    editingId: todo.id, 
                    editText: todo.title 
                  });
                  
                  // Add document click handler using event registry
                  setTimeout(() => {
                    const outsideClickId = "outside_click_" + todo.id + "_" + Date.now();
                    
                    const handleOutsideClick = (e) => {
                      const editInput = document.querySelector('.edit');
                      if (editInput && !editInput.contains(e.target)) {
                        const currentState = router.getState();
                        const trimmedText = currentState.editText.trim();
                        if (trimmedText) {
                          const newTodos = currentState.todos.map((t) =>
                            t.id === todo.id ? { ...t, title: trimmedText } : t
                          );
                          setState({ 
                            todos: newTodos, 
                            editingId: null, 
                            editText: "" 
                          });
                        } else {
                          const newTodos = currentState.todos.filter((t) => t.id !== todo.id);
                          setState({ 
                            todos: newTodos, 
                            editingId: null, 
                            editText: "" 
                          });
                        }
                        // Remove the handler after use
                        delete eventRegistry.handlers.click[outsideClickId];
                      }
                    };
                    
                    eventRegistry.register('click', outsideClickId, handleOutsideClick);
                  }, 0);
                });

                // Handle edit input
                eventRegistry.register("input", editInputId, (e) => {
                  setState({ editText: e.target.value });
                });

                // Handle edit keydown (Enter/Escape)
                eventRegistry.register("keydown", editKeyDownId, (e) => {
                  if (e.keyCode === ENTER_KEY) {
                    const trimmedText = editText.trim();
                    if (trimmedText) {
                      const newTodos = todos.map((t) =>
                        t.id === todo.id ? { ...t, title: trimmedText } : t
                      );
                      setState({ 
                        todos: newTodos, 
                        editingId: null, 
                        editText: "" 
                      });
                    } else {
                      // Delete todo if text is empty
                      const newTodos = todos.filter((t) => t.id !== todo.id);
                      setState({ 
                        todos: newTodos, 
                        editingId: null, 
                        editText: "" 
                      });
                    }
                    // Clean up any outside click handlers for this todo
                    Object.keys(eventRegistry.handlers.click).forEach(key => {
                      if (key.includes('outside_click_' + todo.id)) {
                        delete eventRegistry.handlers.click[key];
                      }
                    });
                  } else if (e.keyCode === ESCAPE_KEY) {
                    setState({ 
                      editingId: null, 
                      editText: "" 
                    });
                    // Clean up any outside click handlers for this todo
                    Object.keys(eventRegistry.handlers.click).forEach(key => {
                      if (key.includes('outside_click_' + todo.id)) {
                        delete eventRegistry.handlers.click[key];
                      }
                    });
                  }
                });

                const liClass = [];
                if (todo.completed) liClass.push("completed");
                if (isEditing) liClass.push("editing");

                return new VNode(
                  "li",
                  {
                    class: liClass.join(" "),
                    key: todo.id,
                  },
                  [
                    new VNode("div", { class: "view" }, [
                      new VNode("input", {
                        class: "toggle",
                        type: "checkbox",
                        checked: todo.completed,
                        "data-onchange": toggleId,
                      }),
                      new VNode("label", {
                        "data-ondblclick": labelDoubleClickId,
                      }, [todo.title]),
                      new VNode("button", {
                        class: "destroy",
                        "data-onclick": destroyId,
                      }),
                    ]),
                    isEditing ? new VNode("input", {
                      class: "edit",
                      value: editText,
                      "data-onkeydown": editKeyDownId,
                      "data-oninput": editInputId,
                      autofocus: "true",
                    }) : null,
                  ].filter(Boolean)
                );
              })
            ),
          ])
        : null,

      todos.length > 0
        ? new VNode(
            "footer",
            { class: "footer" },
            [
              new VNode("span", { class: "todo-count" }, [
                new VNode("strong", {}, [activeTodoCount.toString()]),
                ` item${activeTodoCount !== 1 ? "s" : ""} left`,
              ]),
              new VNode("ul", { class: "filters" }, [
                ...["all", "active", "completed"].map((f) => {
                  return new VNode("li", {}, [
                    new VNode(
                      "a",
                      {
                        class: filter === f ? "selected" : "",
                        href: `#/${f === "all" ? "" : f}`,
                      },
                      [f[0].toUpperCase() + f.slice(1)]
                    ),
                  ]);
                }),
              ]),
              completedCount > 0
                ? (() => {
                    const clearId = "clear_" + Date.now();
                    eventRegistry.register("click", clearId, (e) => {
                      e.preventDefault();
                      setState({
                        todos: todos.filter((todo) => !todo.completed),
                      });
                    });

                    return new VNode(
                      "button",
                      {
                        class: "clear-completed",
                        "data-onclick": clearId,
                      },
                      ["Clear completed"]
                    );
                  })()
                : null,
            ].filter(Boolean)
          )
        : null,
    ].filter(Boolean)
  );
}

function checkLen(arg){
  return arg.length >= 2;
}

// Initial state
const initialState = {
  todos: [],
  filter: "all",
  input: "",
  editingId: null,
  editText: "",
};

// Create app container

// Mount the app
const appContainer = document.createElement("div");
document.body.appendChild(appContainer);

const app = new VDOMManager(appContainer, App, initialState);
app.mount();
// Route handlers that update the filter
const routes = {
  "/": (state, setState) => {
    setState({ filter: "all" });
    app.setState({ ...app.state, filter: "all" });
  },
  "/active": (state, setState) => {
    setState({ filter: "active" });
    app.setState({ ...app.state, filter: "active" });
  },
  "/completed": (state, setState) => {
    setState({ filter: "completed" });
    app.setState({ ...app.state, filter: "completed" });
  },
  "/404": (state, setState) => {
    setState({ filter: "404" });
document.body.innerHTML = `

  <div class="not-found">
    <h1>404</h1>
    <p>Page Not Found</p>
  </div>
`;
  }
};

const router = new Router(routes, initialState);

// Override app's setState to also update router state when needed
const originalSetState = app.setState;
app.setState = (newState) => {
  // Update router state if filter changed
  if (newState.filter && newState.filter !== router.getState().filter) {
    router.setState(newState);
  }
  originalSetState.call(app, newState);
};



