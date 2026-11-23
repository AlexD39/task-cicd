const test = require("node:test");
const assert = require("node:assert/strict");
const { STORAGE_KEY, normalizeTitle, createTask, addTask, toggleTask, removeTask, loadTasks, saveTasks } = require("../src/tasks.js");

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); }
  };
}

test("normalizeTitle elimina espacios innecesarios", () => {
  assert.equal(normalizeTitle("  Preparar   presentación  "), "Preparar presentación");
});

test("createTask crea una tarea pendiente con valores predecibles", () => {
  const task = createTask("  Revisar pruebas ", {
    idFactory: () => "task-1",
    now: () => "2026-11-22T12:00:00.000Z"
  });
  assert.deepEqual(task, { id: "task-1", title: "Revisar pruebas", completed: false, createdAt: "2026-11-22T12:00:00.000Z" });
});

test("createTask rechaza títulos vacíos", () => {
  assert.throws(() => createTask("   "), /debe tener un título/);
  assert.throws(() => createTask(null), /debe tener un título/);
});

test("addTask devuelve una colección nueva sin mutar la original", () => {
  const original = [];
  const result = addTask(original, "Documentar", { idFactory: () => "task-2", now: () => "2026-11-22T12:00:00.000Z" });
  assert.equal(original.length, 0);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Documentar");
});

test("toggleTask cambia solo el estado de la tarea indicada", () => {
  const tasks = [
    { id: "a", title: "A", completed: false, createdAt: "now" },
    { id: "b", title: "B", completed: false, createdAt: "now" }
  ];
  const result = toggleTask(tasks, "b");
  assert.equal(result[0].completed, false);
  assert.equal(result[1].completed, true);
  assert.notEqual(result, tasks);
});

test("removeTask elimina por id y conserva las demás tareas", () => {
  const tasks = [
    { id: "a", title: "A", completed: false, createdAt: "now" },
    { id: "b", title: "B", completed: true, createdAt: "now" }
  ];
  assert.deepEqual(removeTask(tasks, "a"), [tasks[1]]);
});

test("saveTasks y loadTasks persisten una colección válida", () => {
  const storage = createMemoryStorage();
  const tasks = [{ id: "a", title: "Publicar", completed: true, createdAt: "now" }];
  assert.equal(saveTasks(storage, tasks), true);
  assert.deepEqual(loadTasks(storage), tasks);
});

test("loadTasks tolera JSON corrupto y descarta registros inválidos", () => {
  assert.deepEqual(loadTasks(createMemoryStorage({ [STORAGE_KEY]: "{" })), []);
  const mixed = JSON.stringify([
    { id: "ok", title: "Válida", completed: false, createdAt: "now" },
    { id: "bad", title: "Inválida" }
  ]);
  assert.deepEqual(loadTasks(createMemoryStorage({ [STORAGE_KEY]: mixed })), [
    { id: "ok", title: "Válida", completed: false, createdAt: "now" }
  ]);
});

test("las operaciones de almacenamiento fallan de forma segura", () => {
  const brokenStorage = {
    getItem() { throw new Error("unavailable"); },
    setItem() { throw new Error("unavailable"); }
  };
  assert.deepEqual(loadTasks(brokenStorage), []);
  assert.equal(saveTasks(brokenStorage, []), false);
});
