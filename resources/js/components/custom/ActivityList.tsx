import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Eye, Edit, RefreshCw, Trash2 } from 'lucide-react';
import { Activity, ActivityStatus } from '@/types';

interface ActivityListProps {
  activities: Activity[];
  getBadgeClasses: (statusName?: string) => string;
  formatStatus: (statusName?: string) => string;
  getStatus: (statusId: number) => ActivityStatus | undefined;
  openViewUpdates: (activity: Activity) => void;
  openModal: (activity: Activity) => void;
  openUpdateModal: (activity: Activity) => void;
  handleDelete: (id: number) => void;
}

export default function ActivityList({
  activities,
  getBadgeClasses,
  formatStatus,
  getStatus,
  openViewUpdates,
  openModal,
  openUpdateModal,
  handleDelete,
}: ActivityListProps) {
  return (
    <div className="flex flex-col gap-2">
      {activities.length > 0 ? (
        activities.map(activity => (
          <div key={activity.id} className="flex justify-between items-center border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-all text-xs">
            <div className="flex flex-col gap-1 flex-1">
              <span className="font-semibold text-sm text-gray-800">{activity.title}</span>
              {activity.remark && (
                <span className="text-[11px] text-blue-500 italic">{activity.remark}</span>
              )}
              <span className="text-[11px] text-gray-500">Created by: {activity.creator.name}</span>
              <span className="text-[11px] text-gray-400">{activity.updated_at}</span>
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
  );
}
