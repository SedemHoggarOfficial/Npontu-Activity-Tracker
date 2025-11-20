import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
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
import { Check, Clock } from 'lucide-react';
import { Activity, ActivityStatus } from '@/types';

interface IndexProps {
  activities: Activity[];
  activityStatuses: ActivityStatus[];
}

interface ActivityFormData {
  title: string;
  description: string;
  remark: string;
  statusId: number;
}

const breadcrumbs = [{ title: 'Activities', href: '/activities' }];

// Helper to get badge classes based on status
const getBadgeClasses = (statusName?: string) => {
  if (!statusName) return 'bg-gray-200 text-gray-800';
  switch (statusName.toLowerCase()) {
    case 'done':
      return 'bg-green-500 text-white';
    case 'pending':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

// Helper to format status string
const formatStatus = (statusName?: string) =>
  statusName ? statusName.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

export default function Index({ activities: initialActivities, activityStatuses }: IndexProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [listView, setListView] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    remark: '',
    statusId: activityStatuses[0]?.id || 0,
  });

  const filteredActivities = useMemo(
    () => activities.filter((a) => a.title.toLowerCase().includes(search.toLowerCase())),
    [activities, search]
  );

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

  const handleFormChange = (field: keyof ActivityFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (editingActivity) {
      setActivities(
        activities.map((a) =>
          a.id === editingActivity.id
            ? { ...a, ...formData, status_id: formData.statusId }
            : a
        )
      );
    } else {
      const newActivity: Activity = {
        id: Date.now(),
        creator_name: 'You',
        updated_at: new Date().toISOString(),
        ...formData,
        status_id: formData.statusId,
      } as Activity;
      setActivities([...activities, newActivity]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const getStatus = (statusId: number) =>
    activityStatuses.find((s) => s.id === statusId);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activities" />
      <div className="flex flex-col gap-4 p-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button onClick={() => openModal()}>Add Activity</Button>
            <Button variant="outline" onClick={() => setListView(!listView)}>
              {listView ? 'Grid View' : 'List View'}
            </Button>
          </div>
        </div>

        {/* Activities */}
        {listView ? (
          <div className="flex flex-col gap-2">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex justify-between items-center border rounded p-2 hover:shadow transition"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{activity.title}</span>
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getBadgeClasses(getStatus(activity.status_id)?.name)} px-2 py-1 rounded`}>
                      {formatStatus(getStatus(activity.status_id)?.name)}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => openModal(activity)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No activities found.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
                    <Badge className={`${getBadgeClasses(getStatus(activity.status_id)?.name)} px-2 py-1 rounded`}>
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
                      <Button size="sm" variant="outline" onClick={() => openModal(activity)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full text-muted-foreground">No activities found.</p>
            )}
          </div>
        )}
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
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
            <Input
              placeholder="Remark"
              value={formData.remark}
              onChange={(e) => handleFormChange('remark', e.target.value)}
            />
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
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingActivity ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
