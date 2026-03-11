import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getTodoRepository } from '@/lib/database';

export async function GET() {
  try {
    const repo = await getTodoRepository();
    const todos = await repo.find({
      order: { createdAt: 'DESC' },
    });
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const repo = await getTodoRepository();
    const todo = repo.create({
      title: title.trim(),
      description: description ? String(description).trim() : null,
      completed: false,
    });

    const saved = await repo.save(todo);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
