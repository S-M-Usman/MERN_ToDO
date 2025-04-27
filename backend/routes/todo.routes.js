 import { Router } from "express";
import { getAllTodos , updateTodo ,createTodo ,deleteTodo } from "../controllers/todo.controllers.js";
 const TodoRouter =  new Router()
 TodoRouter.get('/', getAllTodos);
 TodoRouter.post('/createTodo',createTodo);
 TodoRouter.put('/updateTodo/:id',updateTodo);
 TodoRouter.patch('/updateTodo/:id',updateTodo);
 TodoRouter.delete('/deleteTodo/:id',deleteTodo);

export default TodoRouter;