"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Pencil, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { TextHoverEffect } from "./text-hover-effect"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Update the Todo type to match your API structure
type ApiTodo = {
  _id: string
  title: string
  completed: boolean
  priority: "normal" | "medium" | "extreme"
  __v: number
}

// This is the structure we use internally
type Todo = {
  id: string
  text: string
  completed: boolean
  priority: "normal" | "medium" | "extreme"
}

// API response type
type ApiResponse = {
  message: string
  success: boolean
  data: ApiTodo[]
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [priority, setPriority] = useState<"normal" | "medium" | "extreme">("normal")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get API URL from environment variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Convert API todo format to our internal format
  const convertApiTodo = (apiTodo: ApiTodo): Todo => {
    return {
      id: apiTodo._id,
      text: apiTodo.title,
      completed: apiTodo.completed,
      priority: apiTodo.priority,
    }
  }

  // Fetch all todos initially
  useEffect(() => {
    const fetchTodos = async () => {
      if (!API_URL) {
        setError("API URL is not configured. Please check your environment variables.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching todos from: ${API_URL}/`)
        const res = await fetch(`${API_URL}/`)

        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`)
        }

        const responseData: ApiResponse = await res.json()
        console.log("API Response:", responseData)

        if (responseData.success && Array.isArray(responseData.data)) {
          // Convert API todos to our internal format
          const convertedTodos = responseData.data.map(convertApiTodo)
          setTodos(convertedTodos)
        } else {
          console.error("API returned unexpected data format:", responseData)
          setTodos([])
          setError("API returned unexpected data format")
        }
      } catch (error) {
        console.error("Failed to fetch todos:", error)
        setError(`Failed to fetch todos: ${error instanceof Error ? error.message : String(error)}`)
        setTodos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodos()
  }, [API_URL])

  const addTodo = async () => {
    if (newTodo.trim() === "" || !API_URL) return

    try {
      const res = await fetch(`${API_URL}/createTodo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodo, // Changed from text to title
          completed: false,
          priority: priority,
        }),
      })

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const responseData: { success: boolean; data: ApiTodo } = await res.json()

      if (responseData.success && responseData.data) {
        const newTodoItem = convertApiTodo(responseData.data)
        setTodos([...todos, newTodoItem])
        setNewTodo("")
        setError(null)
      } else {
        throw new Error("Failed to create todo: Invalid response")
      }
    } catch (error) {
      console.error("Failed to create todo:", error)
      setError(`Failed to create todo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const toggleTodo = async (id: string) => {
    if (!API_URL) return

    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    try {
      const res = await fetch(`${API_URL}/updateTodo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      })

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const responseData = await res.json()

      if (responseData.success) {
        setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
        setError(null)
      } else {
        throw new Error("Failed to update todo: " + responseData.message)
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      setError(`Failed to toggle todo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const deleteTodo = async (id: string) => {
    if (!API_URL) return

    try {
      const res = await fetch(`${API_URL}/deleteTodo/${id}`, { method: "DELETE" })

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const responseData = await res.json()

      if (responseData.success) {
        setTodos(todos.filter((todo) => todo.id !== id))
        setError(null)
      } else {
        throw new Error("Failed to delete todo: " + responseData.message)
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
      setError(`Failed to delete todo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
    setPriority(todo.priority)
  }

  const saveEdit = async () => {
    if (editingId === null || !API_URL) return

    try {
      const res = await fetch(`${API_URL}/updateTodo/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editText, // Changed from text to title
          priority: priority,
        }),
      })

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const responseData = await res.json()

      if (responseData.success) {
        setTodos(todos.map((todo) => (todo.id === editingId ? { ...todo, text: editText, priority: priority } : todo)))
        setEditingId(null)
        setError(null)
      } else {
        throw new Error("Failed to update todo: " + responseData.message)
      }
    } catch (error) {
      console.error("Failed to edit todo:", error)
      setError(`Failed to edit todo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const getFilteredTodos = () => {
    // Make sure todos is an array before filtering
    if (!Array.isArray(todos)) {
      console.error("Todos is not an array:", todos)
      return []
    }

    switch (filter) {
      case "pending":
        return todos.filter((todo) => !todo.completed)
      case "completed":
        return todos.filter((todo) => todo.completed)
      default:
        return todos
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* Header with hover text effect */}
      <div className="h-24 w-full mb-6">
        <TextHoverEffect text="Todo List" duration={0.2} />
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add todo form */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTodo()
              }
            }}
            className="flex-1 bg-gray-900 border-gray-700 text-white"
            disabled={!API_URL || isLoading}
          />
          <button
            onClick={addTodo}
            className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            disabled={!API_URL || isLoading}
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              <Plus className="h-4 w-4 mr-1" /> Add
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-300">Priority:</span>
          <select
            className="p-2 rounded border border-gray-700 text-sm bg-gray-900 text-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "normal" | "medium" | "extreme")}
            disabled={!API_URL || isLoading}
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        {(["all", "pending", "completed"] as const).map((type) => (
          <button
            key={type}
            className={`px-4 py-2 text-gray-300 ${filter === type ? "border-b-2 border-purple-500 font-medium text-white" : ""}`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        /* Todo list */
        <div className="space-y-3">
          {getFilteredTodos().length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks found!</p>
          ) : (
            getFilteredTodos().map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3 bg-gray-900/80 border border-gray-800 rounded-lg ${
                  todo.priority === "extreme"
                    ? "border-l-4 border-l-red-500"
                    : todo.priority === "medium"
                      ? "border-l-4 border-l-yellow-500"
                      : "border-l-4 border-l-green-500"
                }`}
              >
                {editingId === todo.id ? (
                  <div className="flex flex-col space-y-2 w-full">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-gray-900 border-gray-700 text-white"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">Priority:</span>
                      <select
                        className="p-1 rounded border border-gray-700 text-sm bg-gray-900 text-white"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "normal" | "medium" | "extreme")}
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="extreme">Extreme</option>
                      </select>
                      <div className="flex gap-2 ml-auto">
                        <Button size="sm" onClick={saveEdit} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        id={`todo-${todo.id}`}
                        className="border-gray-600"
                      />
                      <div>
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`cursor-pointer ${todo.completed ? "line-through text-gray-500" : "text-white"}`}
                        >
                          {todo.text}
                        </label>
                        <div className="text-xs text-gray-500">
                          {todo.priority === "extreme" ? "Extreme" : todo.priority === "medium" ? "Medium" : "Normal"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(todo)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
