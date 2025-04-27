import TodoList from "@/components/todo-list"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Grid background pattern */}
      <div className="fixed inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"></div>

      {/* Radial gradient for the container to give a faded look */}
      <div className="fixed inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <TodoList />
      </div>
    </main>
  )
}
