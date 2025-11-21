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
        'remark',
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
        return $this->belongsTo(ActivityStatus::class, 'status_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include activities matching a search string.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereHas('creator', function($q2) use ($search) {
                  $q2->where('name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Scope a query to order by latest.
     */
    public function scopeLatestFirst($query)
    {
        return $query->orderByDesc('created_at');
    }

    public function getTodayUpdates()
    {
        return $this->updates()
            ->whereDate('created_at', today())
            ->with('user')
            ->latest()
            ->get();
    }

    public static function getPaginated($request, $perPage = 4)
    {
        $query = self::with(['creator', 'updates' => function($query) {
            $query->latest()->limit(1);
        }])->active();

        if ($request->filled('search')) {
            $query->search($request->query('search'));
        }
        $start = $request->query('start_date');
        $end = $request->query('end_date');
        if (!empty($start) && !empty($end)) {
            $startDateTime = $start . ' 00:00:00';
            $endDateTime = $end . ' 23:59:59';
            $query->whereBetween('created_at', [$startDateTime, $endDateTime]);
        }
        if ($request->filled('user_id')) {
            $query->where('created_by', $request->query('user_id'));
        }
        if ($request->filled('status_id')) {
            $query->where('status_id', $request->query('status_id'));
        }

        return $query->latestFirst()->paginate($perPage)->appends($request->only(['search','start_date','end_date','user_id','status_id']));
    }
}
