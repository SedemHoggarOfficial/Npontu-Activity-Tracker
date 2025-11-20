import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityUpdate } from '@/types';

interface Props {
  start_date: string;
  end_date: string;
  updates: ActivityUpdate[];
  users?: { id: number; name: string; email: string }[];
  statuses?: { id: number; name: string }[];
  activities?: { id: number; title: string }[];
  filters?: { user_id?: number | string | null; status_id?: number | string | null; activity_id?: number | string | null };
}

export default function Report({ start_date, end_date, updates, users = [], statuses = [], activities = [], filters = {} }: Props) {
  const [start, setStart] = useState(start_date);
  const [end, setEnd] = useState(end_date);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params: Record<string, string | number | undefined> = { start_date: start, end_date: end };
    if (filters.user_id) params.user_id = String(filters.user_id);
    if (filters.status_id) params.status_id = String(filters.status_id);
    if (filters.activity_id) params.activity_id = String(filters.activity_id);
    router.get('/activities/report', params);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Activity Report', href: '/activities/report' }]}> 
      <Head title={`Report: ${start} → ${end}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Report {start} → {end}</h2>
          <form onSubmit={submit} className="flex gap-2 items-center">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-2" />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-2" />
            <button className="btn">Run</button>
          </form>
        </div>

        <div className="mb-4 flex gap-2">
          <select className="border rounded p-2" value={String(filters.user_id ?? '')} onChange={(e) => router.get('/activities/report', { start_date: start, end_date: end, user_id: e.target.value || null })}>
            <option value="">All users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select className="border rounded p-2" value={String(filters.status_id ?? '')} onChange={(e) => router.get('/activities/report', { start_date: start, end_date: end, status_id: e.target.value || null })}>
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border rounded p-2" value={String(filters.activity_id ?? '')} onChange={(e) => router.get('/activities/report', { start_date: start, end_date: end, activity_id: e.target.value || null })}>
            <option value="">All activities</option>
            {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>

        {updates.length === 0 ? (
          <p className="text-muted-foreground">No updates in the selected range.</p>
        ) : (
          <div className="space-y-4">
            {updates.map((u) => (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle>{u.activity?.title ?? 'Unknown activity'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Updated by: {u.user?.name ?? 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mb-2">Status: {u.status?.name ?? ''}</div>
                  {u.remark && <div className="italic text-blue-600">Remark: {u.remark}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
