<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityUpdate extends Model
{
    protected $fillable = [
        'activity_id',
        'user_id',
        'status_id',
        'remark',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function status()
    {
        return $this->hasOne(ActivityStatus::class);
    }

     // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('created_at', $date);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeDone($query)
    {
        return $query->where('status', 'done');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
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
