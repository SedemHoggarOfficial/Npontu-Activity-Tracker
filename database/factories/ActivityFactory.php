<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Activity;
use App\Models\User;
use App\Models\ActivityStatus;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Activity::class;

    public function definition(): array
    {
        $statusIds = ActivityStatus::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        return [
            'title' => $this->faker->catchPhrase(),
            // If you want a TO-DO style title:
            // 'title' => $this->faker->catchPhrase(),  
            'description' => $this->faker->realText(200),
            'remark' => $this->faker->optional()->sentence(),
            'status_id' => $this->faker->randomElement($statusIds),
            'created_by' => $this->faker->randomElement($userIds),
            'is_active' => true,
        ];
    }
}
