'use client';

import { useEffect, useState, useCallback } from 'react';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Filter = 'all' | 'active' | 'completed';

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (title: string, description: string) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create todo');
    }
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleUpdate = async (
    id: number,
    updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
  ) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update todo');
    }
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete todo');
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <main className="container">
      <header className="header">
        <h1>✅ My <span>Todo</span> List</h1>
        <p>Stay organized and get things done</p>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-item stat-accent">
          <div className="stat-value">{active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item stat-success">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-item stat-warning">
          <div className="stat-value">
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      <TodoForm onSubmit={handleCreate} />

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="card">
        <div className="list-header">
          <span className="list-title">Tasks</span>
          <span className="list-count">{filteredTodos.length} item{filteredTodos.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="filters">
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${total})`}
              {f === 'active' && ` (${active})`}
              {f === 'completed' && ` (${completed})`}
            </button>
          ))}
        </div>
        <TodoList
          todos={filteredTodos}
          loading={loading}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
