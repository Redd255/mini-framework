const ENTER_KEY = 13;
const eventRegistry = new EventRegistry();
eventRegistry.init();


function App(state, setState) {
  const { todos, filter, input } = state;

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
    setState({ input: e.target.value });
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

                return new VNode(
                  "li",
                  {
                    class: todo.completed ? "completed" : "",
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
                      new VNode("label", {}, [todo.title]),
                      new VNode("button", {
                        class: "destroy",
                        "data-onclick": destroyId,
                      }),
                    ]),
                  ]
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
                `${activeTodoCount} item${
                  activeTodoCount !== 1 ? "s" : ""
                } left`,
              ]),
              new VNode("ul", { class: "filters" }, [
                ...["all", "active", "completed"].map((f) => {
                  const filterId = `filter_${f}`;
                  eventRegistry.register("click", filterId, (e) => {
                    e.preventDefault();
                    setState({ filter: f });
                  });

                  return new VNode("li", {}, [
                    new VNode(
                      "a",
                      {
                        class: filter === f ? "selected" : "",
                        href: `#/${f === "all" ? "" : f}`,
                        "data-onclick": filterId,
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


const initialState = {
  todos: [],
  filter: "all",
  input: "",
};

const appContainer = document.createElement("div");
document.body.appendChild(appContainer);

const app = new VDOMManager(appContainer, App, initialState);
app.mount();