<?php

namespace Tests\Feature\Organization;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrganizationSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $org;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->org = Organization::factory()->create([
            'slug' => 'old-slug',
        ]);

        $this->user = User::factory()->create(['organization_id' => $this->org->id]);
        $this->user->assignRole('org_admin');
    }

    public function test_org_admin_can_view_settings()
    {
        $response = $this->actingAs($this->user)->get(route('organization.edit'));
        $response->assertStatus(200);
    }

    public function test_org_admin_can_update_settings()
    {
        $response = $this->actingAs($this->user)->put(route('organization.update'), [
            'name' => 'New Corp Name',
            'slug' => 'new-corp-name',
            'email' => 'contact@newcorp.com',
            'phone' => '+123456789',
            'website' => 'https://newcorp.com',
            'address' => '123 Fake St',
            'primary_color' => '#ff0000',
            'secondary_color' => '#00ff00',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('organizations', [
            'id' => $this->org->id,
            'name' => 'New Corp Name',
            'slug' => 'new-corp-name',
            'primary_color' => '#ff0000',
        ]);
    }

    public function test_org_admin_can_upload_logo()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('logo.jpg');

        $response = $this->actingAs($this->user)->post(route('organization.logo'), [
            'logo' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->org->refresh();
        $this->assertNotNull($this->org->logo_path);

        Storage::disk('public')->assertExists($this->org->logo_path);
    }
}
