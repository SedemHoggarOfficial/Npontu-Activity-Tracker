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

    // Fullscreen details for an activity (filtered by date/range/user/status)
    Route::get('activities/{activity}/details', [ActivityController::class, 'dailyDetails'])->name('activities.details');

    // Activity updates (status changes / remarks, today's updates, and JSON endpoints)
    Route::get('todays-updates', [ActivityUpdateController::class, 'todaysUpdates'])->name('todays-updates');
    Route::post('activities/{activity}/updates', [ActivityUpdateController::class, 'storeUpdate'])->name('activities.updates.store');
    Route::get('activities/{activity}/updates-json', [ActivityUpdateController::class, 'updatesJson'])->name('activities.updates.json');

    Route::resource('activities', ActivityController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
