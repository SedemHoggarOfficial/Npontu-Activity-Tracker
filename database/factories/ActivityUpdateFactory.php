<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ActivityUpdate;
use App\Models\Activity;
use App\Models\User;
use App\Models\ActivityStatus;

class ActivityUpdateFactory extends Factory
{
    protected $model = ActivityUpdate::class;

    public function definition(): array
    {
        return [
            'activity_id' => Activity::inRandomOrder()->first()?->id ?? Activity::factory(),
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'status_id' => ActivityStatus::inRandomOrder()->first()?->id ?? ActivityStatus::factory(),
            'remark' => $this->faker->sentence(6),
            //'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }
}
