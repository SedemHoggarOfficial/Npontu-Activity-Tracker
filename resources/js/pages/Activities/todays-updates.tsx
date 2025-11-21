import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router, usePage } from '@inertiajs/react';

interface User { id: number; name: string; email?: string; }
interface Status { id: number; name: string; }
interface Update {
  id: number;
  user?: User;
  status?: Status;
  remark?: string;
  created_at: string;
}
interface UpdatesPagination {
  data: Update[];
  current_page: number;
  last_page: number;
}
interface PageProps {
  updates: UpdatesPagination;
  users: User[];
  statuses: Status[];
  filters: { user_id?: string; status_id?: string; start_date?: string; end_date?: string };
}

function formatReadableDate(dateString: string) {
  const date = new Date(dateString);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const j = day % 10, k = day % 100;
  const suffix = (j === 1 && k !== 11) ? "st" : (j === 2 && k !== 12) ? "nd" : (j === 3 && k !== 13) ? "rd" : "th";
  return `${dayName} ${day}${suffix} ${month} ${year}`;
}

export default function TodaysUpdates() {
  const { updates, users, statuses, filters } = (usePage().props as unknown) as PageProps;
  const [localFilters, setLocalFilters] = useState({
    user_id: filters?.user_id || '',
    status_id: filters?.status_id || '',
    start_date: filters?.start_date || '',
    end_date: filters?.end_date || '',
    page: updates.current_page || 1,
  });

  function applyFilters(newFilters: Partial<typeof localFilters>) {
    router.get('/todays-updates', {
      ...localFilters,
      ...newFilters,
      page: 1,
    }, { preserveState: true });
  }

  function goToPage(page: number) {
    router.get('/todays-updates', {
      ...localFilters,
      page,
    }, { preserveState: true });
  }

  return (
    <AppLayout breadcrumbs={[{title:"Today's Updates",href:'/todays-updates'}]}>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Today's Activity Updates</h1>
        <div className="flex flex-wrap items-center gap-3 mb-4 border-b pb-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">From</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={localFilters.start_date ?? ''}
                onChange={e => setLocalFilters(f => ({...f, start_date: e.target.value}))}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">To</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={localFilters.end_date ?? ''}
                onChange={e => setLocalFilters(f => ({...f, end_date: e.target.value}))}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">&nbsp;</label>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-[28px] text-[12px] px-2 py-1 cursor-pointer"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setLocalFilters(f => ({...f, start_date: today, end_date: today}));
                  applyFilters({ start_date: today, end_date: today });
                }}
              >
                Today
              </Button>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">User</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={localFilters.user_id ?? ''}
                onChange={e => { setLocalFilters(f => ({...f, user_id: e.target.value || ''})); applyFilters({ user_id: e.target.value }); }}
              >
                <option value="" className="text-gray-500 bg-gray-50 text-[12px]">All</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-gray-700 bg-white text-[12px] hover:bg-blue-50">{u.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">Status</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={localFilters.status_id ?? ''}
                onChange={e => { setLocalFilters(f => ({...f, status_id: e.target.value || ''})); applyFilters({ status_id: e.target.value }); }}
              >
                <option value="" className="text-gray-500 bg-gray-50 text-[12px]">All</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id} className="text-gray-700 bg-white text-[12px] hover:bg-blue-50">{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end w-full mt-4 md:mt-0">
            <Button
              size="sm"
              className="px-6 cursor-pointer"
              onClick={() => applyFilters(localFilters)}
            >
              Apply
            </Button>
          </div>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6">
          {updates.data.length === 0 ? <div>No updates found.</div> : updates.data.map((u) => (
            <div key={u.id} className="border rounded-lg p-3 bg-white shadow text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm text-gray-800">{u.user?.name ?? 'Unknown'}</span>
                  <span className="ml-2 text-gray-500">{formatReadableDate(u.created_at)}</span>
                </div>
                <Badge>{u.status?.name}</Badge>
              </div>
              {u.remark && <div className="mt-2 text-blue-500 italic">{u.remark}</div>}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Button disabled={updates.current_page <= 1} onClick={() => goToPage(updates.current_page - 1)} className="cursor-pointer">Prev</Button>
          <span>Page {updates.current_page} of {updates.last_page}</span>
          <Button disabled={updates.current_page >= updates.last_page} onClick={() => goToPage(updates.current_page + 1)} className="cursor-pointer">Next</Button>
        </div>
      </div>
    </AppLayout>
  );
}
