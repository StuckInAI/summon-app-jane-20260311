'use client';

import { useState } from 'react';
import { Todo } from '@/app/page';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (
    id: number,
    updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleToggle = async () => {
    if (updating || deleting) return;
    setUpdating(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleEditStart = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditError(null);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) {
      setEditError('Title cannot be empty.');
      return;
    }
    setUpdating(true);
    setEditError(null);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${todo.title}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${deleting ? 'deleting' : ''}`}>
      <div className="todo-checkbox-wrapper">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={updating || deleting || isEditing}
          title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        />
      </div>

      {isEditing ? (
        <div className="edit-form">
          {editError && (
            <div className="error-message" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
              <span>⚠️</span> {editError}
            </div>
          )}
          <div className="form-group">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              maxLength={500}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
          </div>
          <div className="form-group">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
          </div>
          <div className="edit-actions">
            <button
              className="btn btn-primary"
              onClick={handleEditSave}
              disabled={updating}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              {updating ? '⏳' : '💾'} Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleEditCancel}
              disabled={updating}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-content">
          <div className="todo-title">{todo.title}</div>
          {todo.description && (
            <div className="todo-description">{todo.description}</div>
          )}
          <div className="todo-meta">
            <span className="todo-date">🕐 {formatDate(todo.createdAt)}</span>
            <span className={`todo-badge ${todo.completed ? 'todo-badge-done' : 'todo-badge-pending'}`}>
              {todo.completed ? 'Done' : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="todo-actions">
          <button
            className="btn-icon btn-icon-edit"
            onClick={handleEditStart}
            disabled={updating || deleting}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-icon-delete"
            onClick={handleDelete}
            disabled={updating || deleting}
            title="Delete task"
          >
            {deleting ? '⏳' : '🗑️'}
          </button>
        </div>
      )}
    </div>
  );
}
