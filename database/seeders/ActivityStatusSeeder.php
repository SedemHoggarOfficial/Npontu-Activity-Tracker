<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityStatus;

class ActivityStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('activity_statuses')->insertOrIgnore([
            ['name' => 'pending', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'done', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'in_progress', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'on_hold', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // $statuses = ['pending', 'done', 'in_progress', 'on_hold'];

        // foreach ($statuses as $status) {
        //     ActivityStatus::firstOrCreate(['name' => $status]);
        // }
    }
}
