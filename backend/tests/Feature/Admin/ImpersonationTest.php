<?php

namespace Tests\Feature\Admin;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
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

    public function test_super_admin_can_impersonate_active_organization()
    {
        $targetOrg = Organization::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->superAdmin)->post(route('admin.impersonate.start', $targetOrg));

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('success');
        
        $this->assertEquals($targetOrg->id, session('impersonating_organization_id'));
    }

    public function test_super_admin_cannot_impersonate_inactive_organization()
    {
        $targetOrg = Organization::factory()->create(['is_active' => false]);

        $response = $this->actingAs($this->superAdmin)->post(route('admin.impersonate.start', $targetOrg));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertNull(session('impersonating_organization_id'));
    }

    public function test_regular_user_cannot_impersonate_organization()
    {
        $targetOrg = Organization::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->regularUser)->post(route('admin.impersonate.start', $targetOrg));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_stop_impersonating()
    {
        $targetOrg = Organization::factory()->create(['is_active' => true]);

        $this->actingAs($this->superAdmin)->post(route('admin.impersonate.start', $targetOrg));
        $this->assertEquals($targetOrg->id, session('impersonating_organization_id'));

        $response = $this->actingAs($this->superAdmin)->delete(route('admin.impersonate.stop'));

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertNull(session('impersonating_organization_id'));
    }
}
