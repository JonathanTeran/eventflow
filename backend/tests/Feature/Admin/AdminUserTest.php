<?php

namespace Tests\Feature\Admin;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;
    protected Organization $org;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->org = Organization::factory()->create();

        $this->superAdmin = User::factory()->create(['organization_id' => $this->org->id]);
        $this->superAdmin->assignRole('super_admin');

        $this->regularUser = User::factory()->create(['organization_id' => $this->org->id]);
        $this->regularUser->assignRole('org_admin');
    }

    public function test_super_admin_can_view_users_index()
    {
        User::factory()->count(3)->create();

        $response = $this->actingAs($this->superAdmin)->get(route('admin.users.index'));

        $response->assertStatus(200);
    }

    public function test_regular_user_cannot_view_users_index()
    {
        $response = $this->actingAs($this->regularUser)->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_store_user()
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.users.store'), [
            'first_name' => 'New',
            'last_name' => 'Admin',
            'email' => 'tech@neworg.com',
            'password' => 'password123',
            'role' => 'org_admin',
            'organization_id' => $this->org->id,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'tech@neworg.com',
            'first_name' => 'New',
        ]);
        
        $user = User::where('email', 'tech@neworg.com')->first();
        $this->assertTrue($user->hasRole('org_admin'));
    }

    public function test_super_admin_can_update_user()
    {
        $user = User::factory()->create(['first_name' => 'Old Name', 'organization_id' => $this->org->id]);
        $user->assignRole('collaborator');

        $response = $this->actingAs($this->superAdmin)->put(route('admin.users.update', $user), [
            'first_name' => 'Updated Name',
            'last_name' => $user->last_name,
            'email' => 'updated@user.com',
            'organization_id' => $this->org->id,
            'role' => 'org_admin',
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'Updated Name',
            'email' => 'updated@user.com',
        ]);
        $user->refresh();
        $this->assertTrue($user->hasRole('org_admin'));
    }

    public function test_super_admin_can_toggle_user_active_status()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->superAdmin)->patch(route('admin.users.toggle-active', $user));

        $response->assertRedirect();
        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);

        // Toggle back
        $response = $this->actingAs($this->superAdmin)->patch(route('admin.users.toggle-active', $user));
        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null,
        ]);
    }

    public function test_super_admin_cannot_deactivate_super_admin()
    {
        $anotherSuper = User::factory()->create();
        $anotherSuper->assignRole('super_admin');

        $response = $this->actingAs($this->superAdmin)->patch(route('admin.users.toggle-active', $anotherSuper));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertNotSoftDeleted('users', [
            'id' => $anotherSuper->id,
        ]);
    }
}
