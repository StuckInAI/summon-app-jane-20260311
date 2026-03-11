import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getTodoRepository } from '@/lib/database';

type RouteContext = { params: { id: string } };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const id = parseInt(context.params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, completed } = body;

    const repo = await getTodoRepository();
    const todo = await repo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      todo.title = title.trim();
    }

    if (description !== undefined) {
      todo.description = description ? String(description).trim() : null;
    }

    if (completed !== undefined) {
      todo.completed = Boolean(completed);
    }

    const updated = await repo.save(todo);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const id = parseInt(context.params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const repo = await getTodoRepository();
    const todo = await repo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await repo.remove(todo);
    return NextResponse.json(
      { message: 'Todo deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
