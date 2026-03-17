const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Read generated data files
const tasksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-fetching/tasks.json'), 'utf-8'));
const statsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-fetching/statistics.json'), 'utf-8'));

// Flat db for json-server router
const db = {
  tasks: tasksData.tasks,
  statistics: statsData.statistics,
};

const router = jsonServer.router(db);

server.use(middlewares);

// Custom route: GET /tasks → return { tasks, meta } shape
server.get('/tasks', (req, res) => {
  res.json(tasksData);
});

// Custom route: GET /statistics → return { statistics, lastUpdated } shape
server.get('/statistics', (req, res) => {
  res.json(statsData);
});

// All other CRUD routes handled by json-server router
server.use(router);

server.listen(3000, () => {
  console.log('✅ JSON Server running at http://localhost:3000');
  console.log('   GET /tasks       → tasks list');
  console.log('   GET /statistics  → statistics');
});
