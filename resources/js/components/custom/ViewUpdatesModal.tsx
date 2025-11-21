import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import React from 'react';

import { Activity, ActivityStatus, ActivityUpdate } from '@/types';
interface ViewUpdatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowViewClose: boolean;
  setAllowViewClose: (val: boolean) => void;
  viewActivity: Activity | null;
  viewFilters: {
    date?: string;
    start_date?: string;
    end_date?: string;
    user_id?: number | string | undefined;
    status_id?: number | string | undefined;
  };
  setViewFilters: (filters: {
    date?: string;
    start_date?: string;
    end_date?: string;
    user_id?: number | string | undefined;
    status_id?: number | string | undefined;
  }) => void;
  viewUsers: { id: number; name: string; email?: string }[];
  viewStatuses: ActivityStatus[];
  viewLoading: boolean;
  viewUpdates: ActivityUpdate[];
  viewPagination: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  fetchViewUpdates: (activityId: number, params: Record<string, string | number | undefined>) => void;
  formatStatus: (statusName?: string) => string;
  getBadgeClasses: (statusName?: string) => string;
}

export default function ViewUpdatesModal({
  open,
  onOpenChange,
  allowViewClose,
  setAllowViewClose,
  viewActivity,
  viewFilters,
  setViewFilters,
  viewUsers,
  viewStatuses,
  viewLoading,
  viewUpdates,
  viewPagination,
  fetchViewUpdates,
  formatStatus,
  getBadgeClasses,
}: ViewUpdatesModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) return onOpenChange(true);
        if (allowViewClose) {
          setAllowViewClose(false);
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl w-full h-screen max-h-screen flex flex-col p-0 rounded-none">
        <DialogHeader className="flex justify-between items-center px-6 py-4 border-none">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-extrabold text-blue-700 tracking-tight mb-1">Activity Update</DialogTitle>
              {viewActivity?.title && (
                <div className="text-base font-semibold text-gray-700 bg-blue-50 px-3 py-1 rounded shadow-sm w-fit mb-1">{viewActivity.title}</div>
              )}
            </div>
            <button
              type="button"
              aria-label="Close"
              className="ml-2 rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-black text-2xl"
              onClick={() => onOpenChange(false)}
            >
              <span style={{fontSize: '1.75rem', lineHeight: 1}}>&times;</span>
            </button>
          </div>
        </DialogHeader>
        {/* Filters / Controls */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">From</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={viewFilters.start_date ?? ''}
                onChange={(e) => setViewFilters({ ...viewFilters, start_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">To</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={viewFilters.end_date ?? ''}
                onChange={(e) => setViewFilters({ ...viewFilters, end_date: e.target.value })}
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
                  setViewFilters({ ...viewFilters, start_date: today, end_date: today });
                  if (viewActivity)
                    fetchViewUpdates(viewActivity.id, {
                      start_date: today,
                      end_date: today,
                      per_page: viewPagination.per_page || 10,
                      page: 1,
                    });
                }}
              >
                Today
              </Button>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">User</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={viewFilters.user_id ?? ''}
                onChange={(e) => setViewFilters({ ...viewFilters, user_id: e.target.value || '' })}
              >
                <option value="" className="text-gray-500 bg-gray-50 text-[12px]">All</option>
                {viewUsers.map((u) => (
                  <option key={u.id} value={u.id} className="text-gray-700 bg-white text-[12px] hover:bg-blue-50">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold mb-1 text-gray-600">Status</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                value={viewFilters.status_id ?? ''}
                onChange={(e) => setViewFilters({ ...viewFilters, status_id: e.target.value || '' })}
              >
                <option value="" className="text-gray-500 bg-gray-50 text-[12px]">All</option>
                {viewStatuses.map((s) => (
                  <option key={s.id} value={s.id} className="text-gray-700 bg-white text-[12px] hover:bg-blue-50">
                    {formatStatus(s.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end w-full mt-4 md:mt-0">
            <Button
              size="sm"
              className="px-6 cursor-pointer"
              onClick={() => {
                if (!viewActivity) return;
                fetchViewUpdates(viewActivity.id, {
                  start_date: viewFilters.start_date,
                  end_date: viewFilters.end_date,
                  user_id: viewFilters.user_id ?? undefined,
                  status_id: viewFilters.status_id ?? undefined,
                  per_page: viewPagination.per_page || 10,
                  page: 1,
                });
              }}
            >
              Apply
            </Button>
          </div>
        </div>
        {/* Scrollable Updates */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {viewLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading updates…</span>
            </div>
          ) : viewUpdates.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No updates found for the selected range.
            </div>
          ) : (
            viewUpdates.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-2 hover:shadow-lg transition-all text-xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">{u.user?.name ?? 'Unknown'}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-muted-foreground">{new Date(u.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end md:items-start min-w-[160px] w-full md:w-auto">
                    <div className="text-gray-500 font-medium">Status</div>
                    <div className="w-full">
                      <Badge className={getBadgeClasses(u.status?.name) + ' w-full block text-center'}>{formatStatus(u.status?.name)}</Badge>
                    </div>
                  </div>
                </div>
                {u.remark && <div className="mt-3 text-slate-700 border-l-4 border-blue-200 pl-3 italic">{u.remark}</div>}
              </div>
            ))
          )}
        </div>
        {/* Footer / Pagination */}
        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">{viewPagination.total ?? 0} updates</div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!viewPagination.current_page || viewPagination.current_page <= 1 || viewLoading}
              onClick={() => {
                if (!viewActivity || !viewPagination.current_page) return;
                const prev = Math.max(1, (viewPagination.current_page || 1) - 1);
                fetchViewUpdates(viewActivity.id, {
                  start_date: viewFilters.start_date,
                  end_date: viewFilters.end_date,
                  user_id: viewFilters.user_id ?? undefined,
                  status_id: viewFilters.status_id ?? undefined,
                  per_page: viewPagination.per_page || 10,
                  page: prev,
                });
              }}
              className="cursor-pointer"
            >
              Prev
            </Button>
            <div className="px-3">
              Page {viewPagination.current_page ?? 1} / {viewPagination.last_page ?? 1}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={
                !viewPagination.current_page ||
                (viewPagination.last_page ? viewPagination.current_page >= viewPagination.last_page : false) ||
                viewLoading
              }
              onClick={() => {
                if (!viewActivity || !viewPagination.current_page) return;
                const next = Math.min(viewPagination.last_page || 1, (viewPagination.current_page || 1) + 1);
                fetchViewUpdates(viewActivity.id, {
                  start_date: viewFilters.start_date,
                  end_date: viewFilters.end_date,
                  user_id: viewFilters.user_id ?? undefined,
                  status_id: viewFilters.status_id ?? undefined,
                  per_page: viewPagination.per_page || 10,
                  page: next,
                });
              }}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
