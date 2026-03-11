import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve('./database.sqlite');

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [Todo],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}

export async function getTodoRepository() {
  const ds = await getDataSource();
  return ds.getRepository(Todo);
}
