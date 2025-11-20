<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityStatus;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Return dashboard statistics as JSON for the frontend.
     */
    public function stats(Request $request)
    {
        $totalActivities = Activity::count();

        // counts by status
        $statuses = ActivityStatus::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'label' => strtoupper(str_replace('_', ' ', $s->name)),
            ];
        });

        $countsByStatus = Activity::selectRaw('status_id, count(*) as count')
            ->groupBy('status_id')
            ->get()
            ->mapWithKeys(function ($row) {
                return [$row->status_id => $row->count];
            });

        $totalUpdates = ActivityUpdate::count();
        $updatesToday = ActivityUpdate::whereDate('created_at', now()->toDateString())->count();

        $recentUpdates = ActivityUpdate::with(['user', 'activity', 'status'])->latest()->limit(8)->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'remark' => $u->remark,
                'created_at' => $u->created_at->toDateTimeString(),
                'user' => $u->user ? ['id' => $u->user->id, 'name' => $u->user->name] : null,
                'activity' => $u->activity ? ['id' => $u->activity->id, 'title' => $u->activity->title] : null,
                'status' => $u->status ? ['id' => $u->status->id, 'name' => $u->status->name] : null,
            ];
        });

        return response()->json([
            'total_activities' => $totalActivities,
            'counts_by_status' => $countsByStatus,
            'statuses' => $statuses,
            'total_updates' => $totalUpdates,
            'updates_today' => $updatesToday,
            'recent_updates' => $recentUpdates,
        ]);
    }
}

