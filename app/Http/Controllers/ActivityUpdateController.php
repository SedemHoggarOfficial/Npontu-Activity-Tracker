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
        $date = today()->toDateString();
        $query = ActivityUpdate::with(['activity.creator', 'user', 'status'])
            ->whereDate('created_at', $date);

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }
        if ($request->filled('status_id')) {
            $query->where('status_id', $request->query('status_id'));
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->query('start_date'),
                $request->query('end_date'),
            ]);
        }
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);
        $updates = $query->orderBy('created_at', 'asc')->paginate($perPage, ['*'], 'page', $page);
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
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
