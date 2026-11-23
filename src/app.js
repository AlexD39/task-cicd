(function startTaskFlow() {
  "use strict";

  const tasksApi = window.TaskFlowTasks;
  const elements = {
    form: document.querySelector("#task-form"), input: document.querySelector("#task-input"),
    error: document.querySelector("#form-error"), list: document.querySelector("#task-list"),
    template: document.querySelector("#task-template"), count: document.querySelector("#task-count"),
    date: document.querySelector("#current-date"), filters: document.querySelectorAll(".filter"),
    empty: document.querySelector("#empty-state"), emptyTitle: document.querySelector("#empty-title"),
    emptyCopy: document.querySelector("#empty-copy"), progressValue: document.querySelector("#progress-value"),
    progressBar: document.querySelector("#progress-bar"), progressCopy: document.querySelector("#progress-copy")
  };

  let tasks = tasksApi.loadTasks(window.localStorage);
  let currentFilter = "all";
  const formattedDate = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  elements.date.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  function persistAndRender() {
    tasksApi.saveTasks(window.localStorage, tasks);
    render();
  }

  function getVisibleTasks() {
    if (currentFilter === "active") return tasks.filter((task) => !task.completed);
    if (currentFilter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }

  function createTaskElement(task) {
    const fragment = elements.template.content.cloneNode(true);
    const item = fragment.querySelector(".task-item");
    const checkbox = fragment.querySelector(".task-toggle");
    const title = fragment.querySelector(".task-title");
    const removeButton = fragment.querySelector(".delete-task");

    item.dataset.taskId = task.id;
    item.classList.toggle("is-completed", task.completed);
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `${task.completed ? "Marcar como pendiente" : "Marcar como completada"}: ${task.title}`);
    title.textContent = task.title;
    removeButton.setAttribute("aria-label", `Eliminar tarea: ${task.title}`);

    checkbox.addEventListener("change", () => {
      tasks = tasksApi.toggleTask(tasks, task.id);
      persistAndRender();
    });
    removeButton.addEventListener("click", () => {
      tasks = tasksApi.removeTask(tasks, task.id);
      persistAndRender();
    });
    return fragment;
  }

  function updateSummary() {
    const pending = tasks.filter((task) => !task.completed).length;
    const completed = tasks.length - pending;
    const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    elements.count.textContent = `${pending} ${pending === 1 ? "pendiente" : "pendientes"}`;
    elements.progressValue.textContent = `${percentage}%`;
    elements.progressBar.style.width = `${percentage}%`;
    if (!tasks.length) elements.progressCopy.textContent = "Agrega tu primera tarea para comenzar.";
    else if (percentage === 100) elements.progressCopy.textContent = "¡Todo listo! Disfruta de ese impulso.";
    else elements.progressCopy.textContent = `${completed} de ${tasks.length} ${tasks.length === 1 ? "tarea completada" : "tareas completadas"}.`;
  }

  function updateEmptyState(visibleTasks) {
    const messages = {
      all: ["Todo despejado", "Agrega una tarea y empieza a construir impulso."],
      active: ["Nada pendiente", "Has completado todas tus tareas."],
      completed: ["Aún sin completar", "Las tareas que termines aparecerán aquí."]
    };
    elements.empty.hidden = visibleTasks.length > 0;
    [elements.emptyTitle.textContent, elements.emptyCopy.textContent] = messages[currentFilter];
  }

  function render() {
    const visibleTasks = getVisibleTasks();
    elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
    updateSummary();
    updateEmptyState(visibleTasks);
  }

  function updateActiveFilter() {
    elements.filters.forEach((button) => {
      const isActive = button.dataset.filter === currentFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    elements.error.textContent = "";
    try {
      tasks = tasksApi.addTask(tasks, elements.input.value);
      elements.input.value = "";
      currentFilter = "all";
      updateActiveFilter();
      persistAndRender();
      elements.input.focus();
    } catch (error) {
      elements.error.textContent = error.message;
      elements.input.focus();
    }
  });

  elements.filters.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      updateActiveFilter();
      render();
    });
  });

  render();
})();
