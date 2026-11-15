import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const loadTodos = createServerFn({ method: 'GET' }).handler(async ({ context }) => {
  if (!context.supabase) return { rows: [], unavailable: true };
  const { data, error } = await context.supabase.from('todos').select('id,name');
  return error ? { rows: [], unavailable: true } : { rows: data, unavailable: false };
});

export const Route = createFileRoute('/todos')({
  loader: () => loadTodos(),
  component: TodosPage,
});

function TodosPage() {
  const { rows, unavailable } = Route.useLoaderData();
  return <main><h1>Việc cần làm</h1>{unavailable
    ? <p>Chưa đọc được danh sách từ Supabase.</p>
    : rows.length ? <ul>{rows.map(row => <li key={row.id}>{row.name}</li>)}</ul>
    : <p>Chưa có việc cần làm.</p>}</main>;
}
