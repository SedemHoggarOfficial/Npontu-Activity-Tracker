import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Check, Clock, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Activity, ActivityStatus, ActivityUpdate, Paginator } from '@/types';

interface IndexProps {
  activities: Paginator<Activity>;
  activityStatuses: ActivityStatus[];
}

interface ActivityFormData {
  title: string;
  description: string;
  remark: string;
  statusId: number;
}

const breadcrumbs = [{ title: 'Activities', href: '/activities' }];

// Badge styles with same width and opacity
const getBadgeClasses = (statusName?: string) => {
  const base = 'px-3 py-1 rounded text-center w-24';
  if (!statusName) return `${base} bg-gray-200/50 text-gray-800`;
  switch (statusName.toLowerCase()) {
    case 'done':
      return `${base} bg-green-500/80 text-white`;
    case 'pending':
      return `${base} bg-yellow-500/50 text-white`;
    default:
      return `${base} bg-gray-200/50 text-gray-800`;
  }
};

const formatStatus = (statusName?: string) =>
  statusName ? statusName.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

function formatReadableDate(dateString: string) {
  const date = new Date(dateString);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  // Ordinal suffix
  const j = day % 10, k = day % 100;
  const suffix = (j === 1 && k !== 11) ? "st" : (j === 2 && k !== 12) ? "nd" : (j === 3 && k !== 13) ? "rd" : "th";
  return `${dayName} ${day}${suffix} ${month} ${year}`;
}

export default function Index({ activities: initialActivities, activityStatuses }: IndexProps) {
  console.log('activity:', initialActivities);
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [updatingActivity, setUpdatingActivity] = useState<Activity | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<{ statusId: number; remark: string }>({
    statusId: activityStatuses[0]?.id || 0,
    remark: '',
  });
  const [listView, setListView] = useState(true); // Default to list
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string | string[]>>({});
  const [updateFormErrors, setUpdateFormErrors] = useState<Record<string, string | string[]>>({});
  const [viewUpdatesOpen, setViewUpdatesOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<Activity | null>(null);
  const [viewUpdates, setViewUpdates] = useState<ActivityUpdate[]>([]);
  const [viewUsers, setViewUsers] = useState<{id:number;name:string;email?:string}[]>([]);
  const [viewStatuses, setViewStatuses] = useState<ActivityStatus[]>([]);
  const [viewFilters, setViewFilters] = useState<{date?:string; start_date?:string; end_date?:string; user_id?: number | string | undefined; status_id?: number | string | undefined}>({ start_date: new Date().toISOString().slice(0,10), end_date: new Date().toISOString().slice(0,10) });
  const [viewLoading, setViewLoading] = useState(false);
  const [viewPagination, setViewPagination] = useState<{current_page?:number; last_page?:number; per_page?:number; total?:number}>({});
  const [allowViewClose, setAllowViewClose] = useState(false);
  

  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    remark: '',
    statusId: activityStatuses[0]?.id || 0,
  });

  const openModal = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        title: activity.title,
        description: activity.description || '',
        remark: activity.remark || '',
        statusId: activity.status_id,
      });
    } else {
      setEditingActivity(null);
      setFormData({
        title: '',
        description: '',
        remark: '',
        statusId: activityStatuses[0]?.id || 0,
      });
    }
    setModalOpen(true);
  };

  const openUpdateModal = (activity?: Activity) => {
    if (!activity) return;
    setUpdatingActivity(activity);
    setUpdateForm({ statusId: activity.status_id, remark: activity.remark || '' });
    setUpdateModalOpen(true);
  };

  const openViewUpdates = (activity?: Activity) => {
    if (!activity) return;
    setViewActivity(activity);
    const today = new Date().toISOString().slice(0,10);
    setViewFilters({ start_date: today, end_date: today, user_id: '', status_id: '' });
    setViewUpdates([]);
    setViewUsers([]);
    setViewStatuses([]);
    setViewUpdatesOpen(true);
    // fetch first page of range
    fetchViewUpdates(activity.id, { start_date: today, end_date: today, per_page: 10, page: 1 });
  };

  const fetchViewUpdates = async (activityId: number, params: Record<string, string | number | undefined> = {}) => {
    setViewLoading(true);
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, String(v)); });
    const url = `/activities/${activityId}/updates-json` + (qs.toString() ? `?${qs.toString()}` : '');
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      // if paginated response, `data.updates` will be a pagination object
      if (data.updates && Array.isArray(data.updates.data)) {
        setViewUpdates(data.updates.data || []);
        setViewPagination({ current_page: data.updates.current_page, last_page: data.updates.last_page, per_page: data.updates.per_page, total: data.updates.total });
      } else {
        setViewUpdates(data.updates || []);
        setViewPagination({});
      }
      setViewUsers(data.users || []);
      setViewStatuses(data.statuses || []);
    } catch (e) {
      console.error('Failed to load updates', e);
    } finally {
      setViewLoading(false);
    }
  };

  const handleUpdateSave = async () => {
    if (!updatingActivity) return;
    setLoading(true);
    setUpdateFormErrors({});
    const payload = {
      status_id: updateForm.statusId,
      remark: updateForm.remark,
    };

    const previous = activities;
    setActivities({ ...activities, data: activities.data.map(a => a.id === updatingActivity.id ? { ...a, status_id: updateForm.statusId, remark: updateForm.remark } : a) });

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
      const res = await fetch(`/activities/${updatingActivity.id}/updates`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const data = await res.json();
        setUpdateFormErrors((data.errors ?? data) as unknown as Record<string, string | string[]>);
        setActivities(previous);
        return;
      }

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      await res.json();

      if (viewUpdatesOpen && viewActivity) {
        fetchViewUpdates(viewActivity.id, {
          start_date: viewFilters.start_date,
          end_date: viewFilters.end_date,
          user_id: viewFilters.user_id ?? undefined,
          status_id: viewFilters.status_id ?? undefined,
          per_page: viewPagination.per_page || 10,
          page: 1,
        });
      }

      setUpdateModalOpen(false);
      setSuccessMessage('Activity update saved successfully!');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (e) {
      console.error('Failed to save update', e);
      setActivities(previous);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof ActivityFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    setLoading(true);
    setFormErrors({});

    const payload = {
      title: formData.title,
      description: formData.description,
      remark: formData.remark,
      status_id: formData.statusId,
    };

    if (editingActivity) {
      const previous = activities;
      setActivities({ ...activities, data: activities.data.map(a => a.id === editingActivity.id ? { ...a, ...formData, status_id: formData.statusId } : a) });

      router.put(`/activities/${editingActivity.id}`, payload, {
        preserveState: true,
        onError: (errors) => {
          setFormErrors(errors as unknown as Record<string, string | string[]>);
          setActivities(previous);
        },
        onFinish: () => {
          setModalOpen(false);
          setLoading(false);
          setSuccessMessage('Activity updated successfully!');
          setTimeout(() => setSuccessMessage(''), 2500);
        },
      });
    } else {
      const tempId = -Date.now();
      const tempActivity: Activity = {
        id: tempId,
        title: formData.title,
        description: formData.description,
        remark: formData.remark,
        status_id: formData.statusId,
        creator_name: 'You',
        updated_at: new Date().toISOString(),
      } as Activity;

      const previous = activities;
      setActivities({ ...activities, data: [tempActivity, ...activities.data] });

      router.post('/activities', payload, {
        preserveState: true,
        onError: (errors) => {
          setFormErrors(errors as unknown as Record<string, string | string[]>);
          setActivities(previous);
        },
        onFinish: () => {
          setModalOpen(false);
          setLoading(false);
          setSuccessMessage('Activity added successfully!');
          setTimeout(() => setSuccessMessage(''), 2500);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    setLoading(true);
    router.delete(`/activities/${id}`, {
      preserveState: false,
      onFinish: () => setLoading(false),
    });
  };

  const getStatus = (statusId: number) =>
    activityStatuses.find(s => s.id === statusId);

  const goToPage = (page: number) => {
    setLoading(true);
    router.visit('/activities', {
      method: 'get',
      data: { page },
      preserveState: false,
      onFinish: () => setLoading(false),
    });
  };

  // Client-side filtered view of activities (filter current page's items by title)
  const displayedActivities = search.trim()
    ? activities.data.filter(a => (a.title ?? '').toLowerCase().includes(search.toLowerCase()))
    : activities.data;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activities" />
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {successMessage}
        </div>
      )}
      <div className="flex flex-col gap-4 p-4 h-[85vh]">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button onClick={() => openModal()} className="cursor-pointer">Add Activity</Button>
            <Button variant="outline" onClick={() => router.visit('/activities/daily')} className="cursor-pointer">Daily</Button>
            <Button variant="outline" onClick={() => router.visit('/activities/report')} className="cursor-pointer">Report</Button>
            <Button variant="outline" onClick={() => setListView(!listView)} className="cursor-pointer">
              {listView ? 'Grid View' : 'List View'}
            </Button>
          </div>
        </div>

        {/* Scrollable Activities Section */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading data...</span>
            </div>
          ) : listView ? (
            <div className="flex flex-col gap-2">
              {displayedActivities.length > 0 ? (
                displayedActivities.map(activity => (
                  <div key={activity.id} className="flex justify-between items-center border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-all text-xs">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-semibold text-sm text-gray-800">{activity.title}</span>
                      {activity.remark && (
                        <span className="text-[11px] text-blue-500 italic">{activity.remark}</span>
                      )}
                      <span className="text-[11px] text-gray-500">Created by: {activity.creator.name}</span>
                      <span className="text-[11px] text-gray-400">{formatReadableDate(activity.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={getBadgeClasses(getStatus(activity.status_id)?.name)}>
                        {formatStatus(getStatus(activity.status_id)?.name)}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="View Updates" onClick={() => openViewUpdates(activity)} className="cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Updates</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="outline" aria-label="Edit Activity" onClick={() => openModal(activity)} className="cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="secondary" aria-label="Update Status" onClick={() => openUpdateModal(activity)} className="cursor-pointer">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Update Status</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="destructive" aria-label="Delete Activity" onClick={() => handleDelete(activity.id)} className="cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No activities found.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedActivities.length > 0 ? (
                displayedActivities.map(activity => (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
                      <Badge className={getBadgeClasses(getStatus(activity.status_id)?.name)}>
                        {formatStatus(getStatus(activity.status_id)?.name)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.remark && <p className="text-sm text-blue-500 italic">Remark: {activity.remark}</p>}
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Created by: {activity.creator_name}
                        </span>
                        <span className="flex items-center gap-1">
                          {activity.updated_at}
                          <Clock className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" aria-label="Edit Activity" onClick={() => openModal(activity)} className="cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="View Updates" onClick={() => openViewUpdates(activity)} className="cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Updates</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="secondary" aria-label="Update Status" onClick={() => openUpdateModal(activity)} className="cursor-pointer">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Update Status</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="destructive" aria-label="Delete Activity" onClick={() => handleDelete(activity.id)} className="cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center col-span-full text-muted-foreground">No activities found.</p>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 py-4">
            <Button
              variant="outline"
              disabled={activities.current_page === 1 || loading}
              onClick={() => goToPage(activities.current_page - 1)}
              className="cursor-pointer"
            >
              Prev
            </Button>

            <span className="text-sm">
              Page {activities.current_page} of {activities.last_page || 1}
            </span>

            <Button
              variant="outline"
              disabled={activities.current_page === activities.last_page || loading}
              onClick={() => goToPage(activities.current_page + 1)}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
            {formErrors.title && <div className="text-sm text-destructive">{Array.isArray(formErrors.title) ? formErrors.title.join(' ') : formErrors.title}</div>}
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
            {formErrors.description && <div className="text-sm text-destructive">{Array.isArray(formErrors.description) ? formErrors.description.join(' ') : formErrors.description}</div>}
            <Input
              placeholder="Remark"
              value={formData.remark}
              onChange={(e) => handleFormChange('remark', e.target.value)}
            />
            {formErrors.remark && <div className="text-sm text-destructive">{Array.isArray(formErrors.remark) ? formErrors.remark.join(' ') : formErrors.remark}</div>}
            <select
              className="border rounded-md p-2"
              value={formData.statusId}
              onChange={(e) => handleFormChange('statusId', Number(e.target.value))}
            >
              {activityStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {formatStatus(status.name)}
                </option>
              ))}
            </select>
            {formErrors.status_id && <div className="text-sm text-destructive">{Array.isArray(formErrors.status_id) ? formErrors.status_id.join(' ') : formErrors.status_id}</div>}
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="cursor-pointer">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (editingActivity ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Activity Status</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select
              className="border rounded-md p-2"
              value={updateForm.statusId}
              onChange={(e) => setUpdateForm({ ...updateForm, statusId: Number(e.target.value) })}
            >
              {activityStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {formatStatus(status.name)}
                </option>
              ))}
            </select>
            {updateFormErrors.status_id && <div className="text-sm text-destructive">{Array.isArray(updateFormErrors.status_id) ? updateFormErrors.status_id.join(' ') : updateFormErrors.status_id}</div>}
            <Input
              placeholder="Remark"
              value={updateForm.remark}
              onChange={(e) => setUpdateForm({ ...updateForm, remark: e.target.value })}
            />
            {updateFormErrors.remark && <div className="text-sm text-destructive">{Array.isArray(updateFormErrors.remark) ? updateFormErrors.remark.join(' ') : updateFormErrors.remark}</div>}
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)} disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleUpdateSave} disabled={loading} className="cursor-pointer">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : 'Save Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Updates Modal */}
    {/* View Updates Modal (refactored like Edit Activity modal) */}
    <Dialog
      open={viewUpdatesOpen}
      onOpenChange={(open) => {
        // Prevent closing via backdrop or ESC — only allow when allowViewClose flag is set
        if (open) return setViewUpdatesOpen(true);
        if (allowViewClose) {
          setAllowViewClose(false);
          setViewUpdatesOpen(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] flex flex-col p-0">
        
        {/* Header */}
        <DialogHeader className="flex justify-between items-center px-6 py-4 border-b">
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
              onClick={() => {
                setViewUpdatesOpen(false);
              }}
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

    </AppLayout>
  );
}
