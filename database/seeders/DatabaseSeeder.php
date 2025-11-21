<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\ActivityStatus;
use App\Models\Activity;
use App\Models\ActivityUpdate;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        ActivityUpdate::query()->delete(); // delete child table first
        Activity::query()->delete();       // then activities
        ActivityStatus::query()->delete(); // then statuses

        User::firstOrCreate(
            ['email' => 'johndoe@example.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'janedoe@example.com'],
            [
                'name' => 'Jane Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            ActivityStatusSeeder::class,
            ActivitySeeder::class,
            ActivityUpdateSeeder::class,
        ]);
    }
}
