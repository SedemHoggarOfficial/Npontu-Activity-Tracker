// dashboard visuals and data
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// use native date formatting for now

interface RecentUpdate {
    id: number;
    remark?: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    activity?: { id: number; title: string } | null;
    status?: { id: number; name: string } | null;
}

interface DashboardStats {
    total_activities: number;
    counts_by_status: Record<string, number>;
    statuses: { id: number; name: string; label: string }[];
    total_updates: number;
    updates_today: number;
    recent_updates: RecentUpdate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetch('/dashboard-data', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                setStats(data as DashboardStats);
            })
            .catch((e) => console.error('Failed to load dashboard stats', e))
            .finally(() => setLoading(false));

        return () => { mounted = false };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="p-4">
                        <CardHeader>
                            <CardTitle>Total Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{loading ? '…' : stats?.total_activities ?? 0}</div>
                            <div className="text-sm text-muted-foreground mt-2">All activities tracked by the system</div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">View Activities</Button>
                        </CardFooter>
                    </Card>

                    <Card className="p-4">
                        <CardHeader>
                            <CardTitle>Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{loading ? '…' : stats?.total_updates ?? 0}</div>
                            <div className="text-sm text-muted-foreground mt-2">Total updates — <span className="font-medium">{loading ? '…' : stats?.updates_today ?? 0}</span> today</div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">View Updates</Button>
                        </CardFooter>
                    </Card>

                    <Card className="p-4">
                        <CardHeader>
                            <CardTitle>Statuses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                {stats?.statuses?.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">{s.label}</div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{stats?.counts_by_status?.[s.id] ?? 0}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">Manage Statuses</Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Updates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3">
                                    {loading ? (
                                        <div className="text-sm text-muted-foreground">Loading…</div>
                                    ) : (stats?.recent_updates?.length ? (
                                        stats!.recent_updates.map((u) => (
                                            <div key={u.id} className="flex items-start justify-between gap-4 border rounded p-3">
                                                <div>
                                                    <div className="text-sm font-medium">{u.user?.name ?? 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{u.activity?.title ?? '—'}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm">{u.remark ?? <span className="text-muted-foreground">No remark</span>}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="capitalize">{u.status?.name ?? 'unknown'}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No recent updates</div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button variant="ghost" size="sm">View all updates</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={() => window.location.href = '/activities'}>Go to Activities</Button>
                                    <Button variant="outline" onClick={() => window.location.href = '/activities/daily'}>Today's Updates</Button>
                                    <Button variant="ghost" onClick={() => window.location.href = '/settings/appearance'}>Appearance</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
