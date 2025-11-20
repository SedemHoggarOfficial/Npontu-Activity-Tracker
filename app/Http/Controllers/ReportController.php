<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return view('reports.index');
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'activity_id' => 'nullable|exists:activities,id',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:pending,done',
            'report_type' => 'required|in:activity_history,user_activity,summary',
        ]);

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->endOfDay();

        $query = ActivityUpdate::with(['activity', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (!empty($validated['activity_id'])) {
            $query->where('activity_id', $validated['activity_id']);
        }

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $updates = $query->latest()->get();

        // Generate different report types
        $reportData = match($validated['report_type']) {
            'activity_history' => $this->generateActivityHistoryReport($updates),
            'user_activity' => $this->generateUserActivityReport($updates),
            'summary' => $this->generateSummaryReport($updates, $startDate, $endDate),
        };

        return view('reports.view', [
            'reportData' => $reportData,
            'filters' => $validated,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    private function generateActivityHistoryReport($updates)
    {
        return $updates->groupBy('activity_id')->map(function($activityUpdates) {
            $activity = $activityUpdates->first()->activity;
            return [
                'activity' => $activity,
                'updates' => $activityUpdates,
                'done_count' => $activityUpdates->where('status', 'done')->count(),
                'pending_count' => $activityUpdates->where('status', 'pending')->count(),
            ];
        });
    }

    private function generateUserActivityReport($updates)
    {
        return $updates->groupBy('user_id')->map(function($userUpdates) {
            $user = $userUpdates->first()->user;
            return [
                'user' => $user,
                'updates' => $userUpdates,
                'total_updates' => $userUpdates->count(),
                'done_count' => $userUpdates->where('status', 'done')->count(),
                'pending_count' => $userUpdates->where('status', 'pending')->count(),
            ];
        });
    }

    private function generateSummaryReport($updates, $startDate, $endDate)
    {
        return [
            'total_updates' => $updates->count(),
            'done_count' => $updates->where('status', 'done')->count(),
            'pending_count' => $updates->where('status', 'pending')->count(),
            'activities_updated' => $updates->pluck('activity_id')->unique()->count(),
            'users_active' => $updates->pluck('user_id')->unique()->count(),
            'daily_breakdown' => $updates->groupBy(function($update) {
                return $update->created_at->format('Y-m-d');
            })->map(function($dayUpdates) {
                return [
                    'total' => $dayUpdates->count(),
                    'done' => $dayUpdates->where('status', 'done')->count(),
                    'pending' => $dayUpdates->where('status', 'pending')->count(),
                ];
            }),
        ];
    }
}
