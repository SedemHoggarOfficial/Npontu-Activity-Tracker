import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActivityStatus } from '@/types';
import React from 'react';

interface ActivityFormData {
  title: string;
  description: string;
  remark: string;
  statusId: number;
}

import { Activity } from '@/types';
interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingActivity: Activity | null;
  formData: ActivityFormData;
  formErrors: Record<string, string | string[]>;
  loading: boolean;
  activityStatuses: ActivityStatus[];
  handleFormChange: (field: keyof ActivityFormData, value: string | number) => void;
  handleSave: () => void;
}

const formatStatus = (statusName?: string) =>
  statusName ? statusName.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

export default function ActivityModal({
  open,
  onOpenChange,
  editingActivity,
  formData,
  formErrors,
  loading,
  activityStatuses,
  handleFormChange,
  handleSave,
}: ActivityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
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
  );
}
