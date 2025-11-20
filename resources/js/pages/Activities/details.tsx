import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityUpdate } from '@/types';

interface Props {
  activity: {
    id: number;
    title: string;
    description?: string;
    remark?: string;
    creator?: { id: number; name: string };
  };
  updates: ActivityUpdate[];
  users?: { id: number; name: string; email: string }[];
  statuses?: { id: number; name: string }[];
  filters?: { user_id?: number | string | null; status_id?: number | string | null; start_date?: string; end_date?: string; date?: string };
  rangeLabel?: string;
}

export default function Details({ activity, updates, users = [], statuses = [], filters = {}, rangeLabel = '' }: Props) {
  const [start, setStart] = useState(filters.start_date ?? '');
  const [end, setEnd] = useState(filters.end_date ?? '');
  const [date, setDate] = useState(filters.date ?? '');

  const applyDate = () => {
    if (start && end) {
      router.get(`/activities/${activity.id}/details`, { start_date: start, end_date: end, user_id: filters.user_id ?? undefined, status_id: filters.status_id ?? undefined });
    } else if (date) {
      router.get(`/activities/${activity.id}/details`, { date, user_id: filters.user_id ?? undefined, status_id: filters.status_id ?? undefined });
    }
  };

  const applyFilter = (key: string, value: string | number | null) => {
    const params: Record<string, string | number | undefined> = {};
    if (start && end) {
      params.start_date = start; params.end_date = end;
    } else if (date) {
      params.date = date;
    }
    if (key) params[key] = value ?? undefined;
    router.get(`/activities/${activity.id}/details`, params);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Activity Details', href: `/activities/${activity.id}/details` }]}> 
      <Head title={`Details — ${activity.title}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{activity.title}</h1>
            {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
            <div className="text-xs text-muted-foreground">Created by: {activity.creator?.name}</div>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={() => router.back()}>Back</Button> */}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded p-2" />
          <span className="text-sm self-center">or</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded p-2" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded p-2" />
          <Button onClick={applyDate}>Apply</Button>
        </div>

        <div className="mb-4 flex gap-2">
          <select className="border rounded p-2" value={String(filters.user_id ?? '')} onChange={(e) => applyFilter('user_id', e.target.value || null)}>
            <option value="">All users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select className="border rounded p-2" value={String(filters.status_id ?? '')} onChange={(e) => applyFilter('status_id', e.target.value || null)}>
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Updates {rangeLabel ? `for ${rangeLabel}` : ''}</h2>
          {updates.length === 0 ? (
            <p className="text-muted-foreground">No updates for this selection.</p>
          ) : (
            updates.map(u => (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{u.user?.name ?? 'Unknown'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">At: {new Date(u.created_at).toLocaleString()}</div>
                  <div className="mt-1">Status: {u.status?.name ?? ''}</div>
                  {u.remark && <div className="italic text-blue-600">Remark: {u.remark}</div>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
