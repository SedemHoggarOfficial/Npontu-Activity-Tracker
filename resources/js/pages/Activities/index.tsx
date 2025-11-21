import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import ActivityList from '@/components/custom/ActivityList';
import ActivityGrid from '@/components/custom/ActivityGrid';
import { Input } from '@/components/ui/input';
import ActivityModal from '@/components/custom/ActivityModal';
import UpdateStatusModal from '@/components/custom/UpdateStatusModal';
import ViewUpdatesModal from '@/components/custom/ViewUpdatesModal';
import Pagination from '@/components/custom/Pagination';
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

// ...existing code...

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
            <ActivityList
              activities={displayedActivities}
              getBadgeClasses={getBadgeClasses}
              formatStatus={formatStatus}
              getStatus={getStatus}
              openViewUpdates={openViewUpdates}
              openModal={openModal}
              openUpdateModal={openUpdateModal}
              handleDelete={handleDelete}
            />
          ) : (
            <ActivityGrid
              activities={displayedActivities}
              getBadgeClasses={getBadgeClasses}
              formatStatus={formatStatus}
              getStatus={getStatus}
              openViewUpdates={openViewUpdates}
              openModal={openModal}
              openUpdateModal={openUpdateModal}
              handleDelete={handleDelete}
            />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={activities.current_page}
            lastPage={activities.last_page || 1}
            loading={loading}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* Modal */}
      <ActivityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingActivity={editingActivity}
        formData={formData}
        formErrors={formErrors}
        loading={loading}
        activityStatuses={activityStatuses}
        handleFormChange={handleFormChange}
        handleSave={handleSave}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        updateForm={updateForm}
        updateFormErrors={updateFormErrors}
        loading={loading}
        activityStatuses={activityStatuses}
        setUpdateForm={setUpdateForm}
        handleUpdateSave={handleUpdateSave}
      />

      {/* View Updates Modal */}
      <ViewUpdatesModal
        open={viewUpdatesOpen}
        onOpenChange={setViewUpdatesOpen}
        allowViewClose={allowViewClose}
        setAllowViewClose={setAllowViewClose}
        viewActivity={viewActivity}
        viewFilters={viewFilters}
        setViewFilters={setViewFilters}
        viewUsers={viewUsers}
        viewStatuses={viewStatuses}
        viewLoading={viewLoading}
        viewUpdates={viewUpdates}
        viewPagination={viewPagination}
        fetchViewUpdates={fetchViewUpdates}
        formatStatus={formatStatus}
        getBadgeClasses={getBadgeClasses}
      />
    </AppLayout>
  );
}
