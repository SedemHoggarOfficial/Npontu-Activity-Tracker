<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $activityStatuses = ActivityStatus::all(); // Fetch all activity statuses

        $activities = Activity::with(['creator', 'updates' => function($query) {
            $query->latest()->limit(1);
        }])
        ->active()
        ->latest()
        ->paginate(20);

        return Inertia::render('Activities/index', [
            'activities' => $activities,
            'activityStatuses' => $activityStatuses,
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
}
