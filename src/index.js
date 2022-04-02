const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {

  const {username} = req.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  req.user = user;

  return next();
}

app.get('/', (req, res) => {
    return res.json({ message: 'Hello World' });
    });

app.post('/users', (req, res) => {
  const {name, username} = req.body
  const id = uuidv4();
  const todos = []

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists) {
    return res.status(400).json({error: 'User already exists'})
  }

  const user = {
    id,
    name,
    username,
    todos,
  }

  users.push(user)

  return res.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  return res.json(req.user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {title, deadline} = req.body;
  const id = uuidv4();

  const todoToAdd = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  req.user.todos.push(todoToAdd);

  return res.status(201).json(todoToAdd);

});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {title, deadline} = req.body;

  const todoToUpdate = req.user.todos.find(todo => todo.id === id);

  if(!todoToUpdate) {
    return res.status(404).json({error: 'Todo not found'})
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline);

  return res.json(todoToUpdate);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;

  const todoToUpdate = req.user.todos.find(todo => todo.id === id);

  if(!todoToUpdate) {
    return res.status(404).json({error: 'Todo not found'})
  }

  todoToUpdate.done = !todoToUpdate.done;

  return res.json(todoToUpdate);

});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;

  const todoToDelete = req.user.todos.find(todo => todo.id === id);

  if(!todoToDelete) {
    return res.status(404).json({error: 'Todo not found'})
  }

  req.user.todos = req.user.todos.filter(todo => todo.id !== id);

  return res.status(204).json({"message": "Todo deleted"})
});

module.exports = app;