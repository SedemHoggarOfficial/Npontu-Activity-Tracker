<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', today()->toDateString());
        $selectedDate = Carbon::parse($date);

        // Get all activities with their updates for the selected date
        $activities = Activity::with(['updates' => function($query) use ($selectedDate) {
            $query->whereDate('created_at', $selectedDate)
                  ->with('user')
                  ->latest();
        }])
        ->active()
        ->get()
        ->map(function($activity) use ($selectedDate) {
            $todayUpdates = $activity->updates;
            $latestUpdate = $todayUpdates->first();
            
            return [
                'id' => $activity->id,
                'title' => $activity->title,
                'category' => $activity->category,
                'current_status' => $latestUpdate ? $latestUpdate->status : 'pending',
                'updates' => $todayUpdates,
                'update_count' => $todayUpdates->count(),
            ];
        });

        // Summary statistics
        $stats = [
            'total_activities' => $activities->count(),
            'done_count' => $activities->where('current_status', 'done')->count(),
            'pending_count' => $activities->where('current_status', 'pending')->count(),
            'total_updates' => ActivityUpdate::whereDate('created_at', $selectedDate)->count(),
        ];

        return view('dashboard.index', compact('activities', 'selectedDate', 'stats'));
    }

    public function handover(Request $request)
    {
        $date = $request->input('date', today()->toDateString());
        $selectedDate = Carbon::parse($date);

        // Get pending activities for handover
        $pendingActivities = Activity::with(['updates' => function($query) use ($selectedDate) {
            $query->whereDate('created_at', $selectedDate)
                  ->where('status', 'pending')
                  ->with('user')
                  ->latest();
        }])
        ->active()
        ->get()
        ->filter(function($activity) {
            return $activity->updates->isNotEmpty();
        });

        return view('dashboard.handover', compact('pendingActivities', 'selectedDate'));
    }
}
