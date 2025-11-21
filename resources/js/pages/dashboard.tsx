// dashboard visuals and data
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListTodo, LayoutGrid, RefreshCw, Rocket } from 'lucide-react';

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
    { title: 'Dashboard', href: dashboard().url }
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

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 
                bg-gradient-to-br from-gray-50 to-gray-100 
                dark:from-[#0d0d0d] dark:to-[#111]">

                {/* TOP GRID CARDS */}
                <div className="grid gap-6 md:grid-cols-3">
                    
                    {/* Total Activities */}
                    <Card className="p-6 border-none shadow-md bg-white/80 dark:bg-white/5 backdrop-blur">
                        <CardHeader className="flex items-center gap-3">
                            <Rocket className="text-primary" size={26} />
                            <CardTitle className="text-lg font-semibold tracking-tight">
                                Total Activities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold tracking-tight">
                                {loading ? '…' : stats?.total_activities ?? 0}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Activities recorded in the system
                            </p>
                        </CardContent>
                        {/* <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">View Activities</Button>
                        </CardFooter> */}
                    </Card>

                    {/* Updates */}
                    <Card className="p-6 border-none shadow-md bg-white/80 dark:bg-white/5 backdrop-blur">
                        <CardHeader className="flex items-center gap-3">
                            <RefreshCw className="text-primary" size={26} />
                            <CardTitle className="text-lg font-semibold tracking-tight">Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold tracking-tight">
                                {loading ? '…' : stats?.total_updates ?? 0}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                <span className="font-medium">{loading ? '…' : stats?.updates_today ?? 0}</span> updates today
                            </p>
                        </CardContent>
                        {/* <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">View Updates</Button>
                        </CardFooter> */}
                    </Card>

                    {/* Statuses */}
                    <Card className="p-6 border-none shadow-md bg-white/80 dark:bg-white/5 backdrop-blur">
                        <CardHeader className="flex items-center gap-3">
                            <ListTodo className="text-primary" size={26} />
                            <CardTitle className="text-lg font-semibold tracking-tight">Statuses</CardTitle>
                        </CardHeader>

                        <CardContent className="mt-2 space-y-3">
                            {stats?.statuses?.map((s) => (
                                <div key={s.id} className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">{s.label}</div>
                                    <Badge className="px-3 py-1">
                                        {stats?.counts_by_status?.[s.id] ?? 0}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>

                        {/* <CardFooter className="justify-end">
                            <Button variant="ghost" size="sm">Manage Statuses</Button>
                        </CardFooter> */}
                    </Card>

                </div>

                {/* BOTTOM SECTION */}
                <div className="grid gap-6 md:grid-cols-3">

                    {/* Recent Updates */}
                    <div className="md:col-span-2">
                        <Card className="border-none shadow-md bg-white/80 dark:bg-white/5 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="font-semibold tracking-tight">Recent Updates</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {loading ? (
                                    <p className="text-muted-foreground text-sm">Loading…</p>
                                ) : stats?.recent_updates?.length ? (
                                    stats.recent_updates.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-start gap-4 p-4 rounded-lg border bg-white/60 
                                            dark:bg-white/5 dark:border-gray-800 hover:shadow transition"
                                        >
                                            <div className="flex flex-col w-40">
                                                <span className="text-sm font-medium">
                                                    {u.user?.name ?? 'Unknown'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {u.activity?.title ?? '—'}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    {u.remark ?? (
                                                        <span className="text-muted-foreground">No remark</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(u.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                            <Badge className="capitalize h-fit px-3 py-1">
                                                {u.status?.name ?? 'unknown'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No recent updates</p>
                                )}
                            </CardContent>

                            <CardFooter className="justify-end">
                                <Button onClick={() => window.location.href = '/todays-updates'} className="w-full flex gap-2">
                                    <ListTodo size={18} /> View all todays updates
                                </Button>
                                {/* <Button variant="ghost" size="sm">View all updates</Button> */}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <Card className="border-none shadow-md bg-white/80 dark:bg-white/5 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="font-semibold tracking-tight">Quick Actions</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <Button onClick={() => window.location.href = '/activities'} className="w-full flex gap-2">
                                    <ListTodo size={18} /> Go to Activities
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/todays-updates'}
                                    className="w-full flex gap-2"
                                >
                                    <RefreshCw size={18} /> Today's Updates
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => window.location.href = '/settings/appearance'}
                                    className="w-full flex gap-2"
                                >
                                    <LayoutGrid size={18} /> Appearance
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
