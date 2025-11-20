import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityUpdate } from '@/types';

interface Props {
  date: string;
  updates: ActivityUpdate[];
  users?: { id: number; name: string; email: string }[];
  statuses?: { id: number; name: string }[];
  activities?: { id: number; title: string }[];
  filters?: { user_id?: number | string | null; status_id?: number | string | null; activity_id?: number | string | null };
}

export default function Daily({ date, updates, users = [], statuses = [], activities = [], filters = {} }: Props) {
  // Group updates by activity id
  const grouped = updates.reduce<Record<number, ActivityUpdate[]>>((acc, u) => {
    const id = u.activity?.id ?? 0;
    if (!acc[id]) acc[id] = [];
    acc[id].push(u);
    return acc;
  }, {});

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.get('/activities/daily', { date: e.target.value });
  };

  const onFilterChange = (key: string, value: string | number | null) => {
    const params: Record<string, string | number | undefined> = { date } as Record<string, string | number | undefined>;
    if (key === 'user_id' && value) params.user_id = value as string | number;
    if (key === 'status_id' && value) params.status_id = value as string | number;
    if (key === 'activity_id' && value) params.activity_id = value as string | number;
    router.get('/activities/daily', params);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Daily Updates', href: '/activities/daily' }]}>
      <Head title={`Daily Updates - ${date}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Updates for {date}</h2>
          <input type="date" defaultValue={date} onChange={onChangeDate} className="border rounded p-2" />
        </div>

        <div>
          <div className="flex gap-2 mb-4">
            <select className="border rounded p-2" value={String(filters.user_id ?? '')} onChange={(e) => onFilterChange('user_id', e.target.value || null)}>
              <option value="">All users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select className="border rounded p-2" value={String(filters.status_id ?? '')} onChange={(e) => onFilterChange('status_id', e.target.value || null)}>
              <option value="">All statuses</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select className="border rounded p-2" value={String(filters.activity_id ?? '')} onChange={(e) => onFilterChange('activity_id', e.target.value || null)}>
              <option value="">All activities</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          {updates.length === 0 ? (
            <p className="text-muted-foreground">No updates for this date.</p>
          ) : (
            <div className="space-y-4">
              {Object.values(grouped).map((list) => {
                const activityId = list[0].activity?.id ?? 0;
                const activityTitle = list[0].activity?.title ?? 'Unknown activity';
                return (
                  <Card key={activityId}>
                    <CardHeader>
                      <CardTitle>{activityTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end mb-2">
                        <Button onClick={() => router.get(`/activities/${activityId}/details`, { date, user_id: filters.user_id ?? undefined, status_id: filters.status_id ?? undefined })}>Details</Button>
                      </div>
                      {list.map((u) => (
                        <div key={u.id} className="border-b py-2 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{u.user?.name ?? 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleTimeString()}</div>
                          </div>
                          <div className="text-sm">Status: {u.status?.name ?? ''}</div>
                          {u.remark && <div className="italic text-blue-600">Remark: {u.remark}</div>}
                          <div className="text-xs text-muted-foreground">Bio: {u.user?.email ?? ''}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
