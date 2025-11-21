<?php

namespace App\Http\Controllers;

use App\Models\ActivityUpdate;
use Illuminate\Http\Request;

class ActivityUpdateController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'status_id' => 'required|integer|exists:activity_statuses,id',
            'remarks' => 'required|string',
        ]);

        $activityUpdate = ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => Auth::id(),
            'status_id' => $validated['status_id'],
            'remarks' => $validated['remarks'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Status updated successfully!');
    }

    /**
     * Show all today's updates for the sidebar view.
     */
    public function todaysUpdates(Request $request)
    {
        $query = ActivityUpdate::with(['activity.creator', 'user', 'status']);

        // Date filtering: if both start and end provided, use full day range; else default to today
        $start = $request->query('start_date');
        $end = $request->query('end_date');
        if (!empty($start) && !empty($end)) {
            $startDateTime = $start . ' 00:00:00';
            $endDateTime = $end . ' 23:59:59';
            $query->whereBetween('created_at', [$startDateTime, $endDateTime]);
        } else {
            $date = today()->toDateString();
            $query->whereDate('created_at', $date);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }
        if ($request->filled('status_id')) {
            $query->where('status_id', $request->query('status_id'));
        }
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);
        $updates = $query->orderBy('created_at', 'asc')->paginate($perPage, ['*'], 'page', $page);
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        // Ensure logged-in user is included
        $authUser = $request->user();
        if ($authUser && !$users->contains('id', $authUser->id)) {
            $users->push($authUser->only(['id', 'name', 'email']));
        }
        $statuses = \App\Models\ActivityStatus::all();
        return \Inertia\Inertia::render('Activities/todays-updates', [
            'updates' => $updates,
            'users' => $users,
            'statuses' => $statuses,
            'filters' => [
                'user_id' => $request->query('user_id'),
                'status_id' => $request->query('status_id'),
                'start_date' => $request->query('start_date'),
                'end_date' => $request->query('end_date'),
            ],
        ]);
    }
}
