<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updates()
    {
        return $this->hasMany(ActivityUpdate::class);
    }

    public function status()
    {
        return $this->hasOne(ActivityStatus::class);
    }


    // Helper functions
    public function getTodayUpdates()
    {
        return $this->updates()
            ->whereDate('created_at', today())
            ->with('user')
            ->latest()
            ->get();
    }
}
