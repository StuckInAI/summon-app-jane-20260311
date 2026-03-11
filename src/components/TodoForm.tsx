'use client';

import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onSubmit: (title: string, description: string) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for your task.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-title">
        <span>➕</span> Add New Task
      </div>
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          ✅ Task created successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="todo-title">Title *</label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={500}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="todo-description">Description</label>
          <textarea
            id="todo-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details (optional)..."
            rows={2}
            maxLength={2000}
          />
        </div>
        <div className="form-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setTitle(''); setDescription(''); setError(null); }}
            disabled={loading}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !title.trim()}
          >
            {loading ? '⏳ Adding...' : '➕ Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
