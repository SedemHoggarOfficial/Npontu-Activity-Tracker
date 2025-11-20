<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    // Accessor to always return name in uppercase and replace underscores with spaces.
    public function getNameAttribute($value): string
    {
        // Replace underscores with spaces and convert to uppercase
        return strtoupper(str_replace('_', ' ', $value));
    }
}
