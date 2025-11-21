import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Eye, Edit, RefreshCw, Trash2, Check, Clock } from 'lucide-react';
import { Activity, ActivityStatus } from '@/types';

interface ActivityGridProps {
  activities: Activity[];
  getBadgeClasses: (statusName?: string) => string;
  formatStatus: (statusName?: string) => string;
  getStatus: (statusId: number) => ActivityStatus | undefined;
  openViewUpdates: (activity: Activity) => void;
  openModal: (activity: Activity) => void;
  openUpdateModal: (activity: Activity) => void;
  handleDelete: (id: number) => void;
}

export default function ActivityGrid({
  activities,
  getBadgeClasses,
  formatStatus,
  getStatus,
  openViewUpdates,
  openModal,
  openUpdateModal,
  handleDelete,
}: ActivityGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.length > 0 ? (
        activities.map(activity => (
          <div key={activity.id} className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-semibold">{activity.title}</span>
                <Badge className={getBadgeClasses(getStatus(activity.status_id)?.name)}>
                  {formatStatus(getStatus(activity.status_id)?.name)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              {activity.remark && <p className="text-sm text-blue-500 italic">Remark: {activity.remark}</p>}
            </div>
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
          </div>
        ))
      ) : (
        <p className="text-center col-span-full text-muted-foreground">No activities found.</p>
      )}
    </div>
  );
}
