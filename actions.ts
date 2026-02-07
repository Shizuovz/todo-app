import { db } from './db';
import { Todo, Priority } from './types';

/**
 * Server Actions for Database logic.
 * These run strictly on the server in a Next.js environment.
 */

export async function getTodos(): Promise<Todo[]> {
  try {
    return await db.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function createTodo(formData: FormData): Promise<Todo> {
  const title = formData.get('title') as string;
  const priority = (formData.get('priority') as Priority) || Priority.LOW;
  
  if (!title || title.trim() === '') {
    throw new Error("Title is required");
  }

  return await db.todo.create({
    data: {
      title: title.trim(),
      priority,
    },
  });
}

export async function toggleTodoStatus(id: string, completed: boolean): Promise<Todo> {
  return await db.todo.update({
    where: { id },
    data: { completed },
  });
}

export async function deleteTodoAction(id: string): Promise<void> {
  await db.todo.delete({
    where: { id },
  });
}

export async function updateTodoTitle(id: string, title: string): Promise<Todo> {
  return await db.todo.update({
    where: { id },
    data: { title },
  });
}
