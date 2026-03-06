<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin (no organization)
        $superAdmin = User::create([
            'organization_id' => null,
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Create demo organization
        $organization = Organization::create([
            'name' => 'AmePhia Systems',
            'slug' => 'amephia-systems',
            'email' => 'info@amephia.com',
            'website' => 'https://amephia.com',
            'primary_color' => '#6366f1',
            'secondary_color' => '#4f46e5',
            'is_active' => true,
        ]);

        // Create admin user
        $admin = User::create([
            'organization_id' => $organization->id,
            'first_name' => 'Jonathan',
            'last_name' => 'Terán',
            'email' => 'admin@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('org_admin');

        // Create collaborator user
        $collaborator = User::create([
            'organization_id' => $organization->id,
            'first_name' => 'María',
            'last_name' => 'García',
            'email' => 'maria@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $collaborator->assignRole('collaborator');
    }
}
