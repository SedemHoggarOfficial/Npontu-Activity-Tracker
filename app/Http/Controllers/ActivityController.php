<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\ActivityUpdate;
use Carbon\Carbon;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $activityStatuses = ActivityStatus::all();
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        $activities = Activity::getPaginated($request);

        return Inertia::render('Activities/index', [
            'activities' => $activities,
            'activityStatuses' => $activityStatuses,
            'users' => $users,
            'filters' => [
                'search' => $request->query('search'),
                'start_date' => $request->query('start_date'),
                'end_date' => $request->query('end_date'),
                'user_id' => $request->query('user_id'),
                'status_id' => $request->query('status_id'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('activities.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status_id' => 'required|integer|exists:activity_statuses,id',
        ]);

        $activity = Activity::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('activities.index')
            ->with('success', 'Activity created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity)
    {
        $activity->load(['creator', 'updates.user']);
        
        $updates = $activity->updates()
            ->with('user')
            ->latest()
            ->paginate(20);

        return view('activities.show', compact('activity', 'updates'));
    }

    /**
     * Store a status update for an activity.
     */
    public function storeUpdate(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'status_id' => 'required|integer|exists:activity_statuses,id',
            'remark' => 'nullable|string',
        ]);

        $update = ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => Auth::id(),
            'status_id' => $validated['status_id'],
            'remark' => $validated['remark'] ?? null,
        ]);

        // Update the activity current status
        $activity->status_id = $validated['status_id'];
        $activity->save();

        // Return back with a success message for Inertia or regular requests
        if ($request->wantsJson() || $request->isJson()) {
            return response()->json(['message' => 'Update saved', 'update' => $update], 201);
        }

        return redirect()->back()->with('success', 'Activity update saved');
    }


    /**
     * Fullscreen details for a single activity with filters (date or range, user, status).
     */
    public function dailyDetails(Request $request, Activity $activity)
    {
        // If date provided, use it; otherwise allow start_date/end_date range, default today
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->query('start_date'))->startOfDay();
            $end = Carbon::parse($request->query('end_date'))->endOfDay();
            $query = $activity->updates()->with(['user', 'status'])->whereBetween('created_at', [$start, $end]);
            $rangeLabel = $start->toDateString() . ' → ' . $end->toDateString();
        } else {
            $date = $request->query('date', today()->toDateString());
            $parsed = Carbon::parse($date)->toDateString();
            $query = $activity->updates()->with(['user', 'status'])->whereDate('created_at', $parsed);
            $rangeLabel = $parsed;
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->query('status_id'));
        }

        // $updates = $query->orderBy('created_at', 'asc')->get();
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);

        $updates = $query
            ->orderBy('created_at', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        // For filters UI
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        $statuses = ActivityStatus::all();

        return Inertia::render('Activities/details', [
            'activity' => $activity->load('creator'),
            'updates' => $updates,
            'rangeLabel' => $rangeLabel,
            'filters' => [
                'user_id' => $request->query('user_id'),
                'status_id' => $request->query('status_id'),
                'start_date' => $request->query('start_date'),
                'end_date' => $request->query('end_date'),
                'date' => $request->query('date'),
            ],
            'users' => $users,
            'statuses' => $statuses,
        ]);
    }

    public function updatesJson(Request $request, Activity $activity)
    {
        $query = $activity->updates()->with(['user', 'status']);

        // default to today
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->query('start_date'))->startOfDay();
            $end = Carbon::parse($request->query('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        } elseif ($request->filled('date')) {
            $date = Carbon::parse($request->query('date'))->toDateString();
            $query->whereDate('created_at', $date);
        } else {
            $query->whereDate('created_at', today());
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->query('status_id'));
        }

        // $updates = $query->orderBy('created_at', 'asc')->get();
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);

        $updates = $query
            ->orderBy('created_at', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Provide user and status lists to populate modal selects
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        $statuses = ActivityStatus::all();

        return response()->json([
            'activity' => $activity,
            'updates' => $updates,
            'users' => $users,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Activity $activity)
    {
        return view('activities.edit', compact('activity'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status_id' => 'required|integer|exists:activity_statuses,id',
            'is_active' => 'boolean',
        ]);

        $activity->update($validated);

        return redirect()
            ->route('activities.index')
            ->with('success', 'Activity updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity)
    {
        //
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
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);
        $updates = $query->orderBy('created_at', 'asc')->paginate($perPage, ['*'], 'page', $page);
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        $statuses = ActivityStatus::all();
        return Inertia::render('Activities/todays-updates', [
            'updates' => $updates,
            'users' => $users,
            'statuses' => $statuses,
            'filters' => [
                'user_id' => $request->query('user_id'),
                'status_id' => $request->query('status_id'),
            ],
        ]);
    }
}
