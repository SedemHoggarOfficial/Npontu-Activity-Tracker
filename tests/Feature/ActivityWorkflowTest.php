<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityStatus;
use App\Models\ActivityUpdate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ActivityWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        // Seed statuses
        \DB::table('activity_statuses')->insert([
            ['name' => 'pending', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'done', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function test_user_can_create_activity()
    {
        $user = User::factory()->create();

        $status = ActivityStatus::first();

        $response = $this->actingAs($user)->post('/activities', [
            'title' => 'Daily SMS count',
            'description' => 'Compare SMS counts',
            'status_id' => $status->id,
        ]);

        $response->assertRedirect('/activities');

        $this->assertDatabaseHas('activities', [
            'title' => 'Daily SMS count',
            'created_by' => $user->id,
        ]);
    }

    public function test_user_can_update_activity()
    {
        $user = User::factory()->create();
        $status = ActivityStatus::first();

        $activity = Activity::factory()->create(['created_by' => $user->id, 'status_id' => $status->id]);

        $newStatus = ActivityStatus::where('id', '!=', $status->id)->first();

        $response = $this->actingAs($user)->put("/activities/{$activity->id}", [
            'title' => 'Updated title',
            'description' => 'Updated description',
            'status_id' => $newStatus->id,
            'is_active' => true,
        ]);

        $response->assertRedirect('/activities');

        $this->assertDatabaseHas('activities', [
            'id' => $activity->id,
            'title' => 'Updated title',
            'status_id' => $newStatus->id,
        ]);
    }

    public function test_user_can_add_activity_update_record()
    {
        $user = User::factory()->create();
        $status = ActivityStatus::first();

        $activity = Activity::factory()->create(['created_by' => $user->id, 'status_id' => $status->id]);

        $newStatus = ActivityStatus::where('id', '!=', $status->id)->first();

        $response = $this->actingAs($user)->post("/activities/{$activity->id}/updates", [
            'status_id' => $newStatus->id,
            'remark' => 'Checked logs',
        ]);

        // After creating update, controller redirects back by default
        $response->assertRedirect();

        $this->assertDatabaseHas('activity_updates', [
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'status_id' => $newStatus->id,
            'remark' => 'Checked logs',
        ]);

        // Activity status should be updated
        $this->assertDatabaseHas('activities', [
            'id' => $activity->id,
            'status_id' => $newStatus->id,
        ]);
    }

    public function test_daily_and_report_endpoints()
    {
        $user = User::factory()->create();
        $status = ActivityStatus::first();

        $activity = Activity::factory()->create(['created_by' => $user->id, 'status_id' => $status->id]);

        ActivityUpdate::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'status_id' => $status->id,
            'created_at' => Carbon::today(),
        ]);

        $this->actingAs($user)->get('/activities/daily')->assertStatus(200);

        $start = Carbon::today()->subDays(1)->toDateString();
        $end = Carbon::today()->toDateString();

        $this->actingAs($user)->get('/activities/report?start_date='.$start.'&end_date='.$end)->assertStatus(200);
    }
}
