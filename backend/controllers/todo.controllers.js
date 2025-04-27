import Todo from '../models/todo.models.js';

export const createTodo = async (req, res) => {
    const { title, completed, priority } = req.body;
    try {
        const todo = new Todo({ title, completed, priority });
        await todo.save();
        res.status(201).json({
            message: 'Todo created successfully',
            success: true,
            data: todo
        });
    } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({
            message: 'Failed to create todo',
            success: false,
            error: error.message
        });
    }
};

export const getAllTodos = async (req, res) => {
    const { priority } = req.query;
    try {
        let query = {};
        if (priority) query.priority = priority;
        const todo_data = await Todo.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Todos fetched successfully',
            success: true,
            data: todo_data
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to load todos',
            success: false,
            error: err.message
        });
    }
};

export const updateTodo = async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({
            message: "Todo updated successfully",
            success: true,
            data: updatedTodo
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating Todo",
            success: false,
            error: error.message
        });
    }
};

export const deleteTodo = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedTodo = await Todo.findByIdAndDelete(id);

        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found', success: false });
        }

        res.status(200).json({
            message: 'Todo deleted successfully',
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete todo',
            success: false,
            error: err.message
        });
    }
};
