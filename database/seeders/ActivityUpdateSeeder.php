<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityUpdate;

class ActivityUpdateSeeder extends Seeder
{
    public function run(): void
    {
        // Delete old data first
        ActivityUpdate::truncate();

        // Create 50 updates
        ActivityUpdate::factory()->count(50)->create();
    }
}
