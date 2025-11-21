<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityUpdateController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Dashboard JSON endpoint for stats
    Route::get('dashboard-data', [\App\Http\Controllers\DashboardController::class, 'stats'])->name('dashboard.data');

    // Activity updates (status changes / remarks)
    Route::post('activities/{activity}/updates', [ActivityController::class, 'storeUpdate'])->name('activities.updates.store');

    // Daily view of updates
    Route::get('activities/daily', [ActivityController::class, 'daily'])->name('activities.daily');

    // Reporting: date range
    Route::get('activities/report', [ActivityController::class, 'report'])->name('activities.report');

    // Fullscreen details for an activity (filtered by date/range/user/status)
    Route::get('activities/{activity}/details', [ActivityController::class, 'dailyDetails'])->name('activities.details');
    // JSON endpoint for activity updates (used by View Updates modal)
    Route::get('activities/{activity}/updates-json', [ActivityController::class, 'updatesJson'])->name('activities.updates.json');
    // JSON endpoint for activity updates (used by index modal)
    Route::get('activities/{activity}/updates-json', [ActivityController::class, 'updatesJson'])->name('activities.updates.json');

    Route::get('activities/todays-updates', [ActivityUpdateController::class, 'todaysUpdates'])->name('activities.todays-updates');

    Route::resource('activities', ActivityController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
});

require __DIR__.'/settings.php';
