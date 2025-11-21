import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActivityStatus } from '@/types';
import React from 'react';

interface UpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateForm: { statusId: number; remark: string };
  updateFormErrors: Record<string, string | string[]>;
  loading: boolean;
  activityStatuses: ActivityStatus[];
  setUpdateForm: (form: { statusId: number; remark: string }) => void;
  handleUpdateSave: () => void;
}

const formatStatus = (statusName?: string) =>
  statusName ? statusName.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

export default function UpdateStatusModal({
  open,
  onOpenChange,
  updateForm,
  updateFormErrors,
  loading,
  activityStatuses,
  setUpdateForm,
  handleUpdateSave,
}: UpdateStatusModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
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
  );
}
