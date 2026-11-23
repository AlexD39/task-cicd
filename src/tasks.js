(function exposeTaskModule(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TaskFlowTasks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTaskModule() {
  "use strict";

  const STORAGE_KEY = "taskflow.tasks.v1";

  function normalizeTitle(title) {
    return typeof title === "string" ? title.trim().replace(/\s+/g, " ") : "";
  }

  function createTask(title, options = {}) {
    const normalizedTitle = normalizeTitle(title);
    if (!normalizedTitle) throw new TypeError("La tarea debe tener un título.");

    const idFactory = options.idFactory || defaultIdFactory;
    const now = options.now || (() => new Date().toISOString());
    return { id: idFactory(), title: normalizedTitle, completed: false, createdAt: now() };
  }

  function defaultIdFactory() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addTask(tasks, title, options) {
    return [...tasks, createTask(title, options)];
  }

  function toggleTask(tasks, id) {
    return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  }

  function removeTask(tasks, id) {
    return tasks.filter((task) => task.id !== id);
  }

  function isValidTask(task) {
    return Boolean(task && typeof task.id === "string" && typeof task.title === "string" &&
      typeof task.completed === "boolean" && typeof task.createdAt === "string");
  }

  function loadTasks(storage, key = STORAGE_KEY) {
    if (!storage || typeof storage.getItem !== "function") return [];
    try {
      const value = storage.getItem(key);
      const tasks = value ? JSON.parse(value) : [];
      return Array.isArray(tasks) ? tasks.filter(isValidTask) : [];
    } catch {
      return [];
    }
  }

  function saveTasks(storage, tasks, key = STORAGE_KEY) {
    if (!storage || typeof storage.setItem !== "function") return false;
    try {
      storage.setItem(key, JSON.stringify(tasks));
      return true;
    } catch {
      return false;
    }
  }

  return { STORAGE_KEY, normalizeTitle, createTask, addTask, toggleTask, removeTask, loadTasks, saveTasks };
});
