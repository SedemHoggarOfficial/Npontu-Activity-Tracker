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

    // No accessor: use raw value for filtering, format in frontend only
}
