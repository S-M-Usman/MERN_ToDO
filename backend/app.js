import express from 'express';
import { PORT } from './config/env.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import TodoRouter from './routes/todo.routes.js';
import connectToDatabase from './database/mongodb.js'

//Middleware
const app = express();
app.use(cors({origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/v1/todos', TodoRouter);


app.get('/', (req, res) => {
  res.send('Welcome to the Subscription Tracker API!');
});

app.listen(PORT, async () => {
  console.log(`Todo App is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;