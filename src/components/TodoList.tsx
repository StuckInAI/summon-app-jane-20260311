'use client';

import { Todo } from '@/app/page';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onUpdate: (
    id: number,
    updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TodoList({
  todos,
  loading,
  onUpdate,
  onDelete,
}: TodoListProps) {
  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <p className="loading-text">Loading your tasks...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <p>No tasks found</p>
        <span>Add a new task above to get started!</span>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
