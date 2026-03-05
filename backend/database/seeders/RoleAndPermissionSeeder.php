<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Organization
            'organization.view',
            'organization.update',
            'organization.manage_users',

            // Events
            'events.view',
            'events.create',
            'events.update',
            'events.delete',

            // Participants
            'participants.view',
            'participants.create',
            'participants.update',
            'participants.checkin',

            // Speakers
            'speakers.view',
            'speakers.create',
            'speakers.update',
            'speakers.delete',

            // Sponsors
            'sponsors.view',
            'sponsors.create',
            'sponsors.update',
            'sponsors.delete',
            'sponsors.view_leads',

            // Communities
            'communities.view',
            'communities.create',
            'communities.update',
            'communities.delete',

            // Agenda
            'agenda.view',
            'agenda.create',
            'agenda.update',
            'agenda.delete',

            // Networking
            'networking.use',

            // Communications
            'communications.view',
            'communications.send',
            'communications.configure',

            // Check-in
            'checkin.perform',
            'checkin.print_badge',

            // Platform (super admin only)
            'platform.dashboard',
            'platform.organizations.view',
            'platform.organizations.create',
            'platform.organizations.update',
            'platform.organizations.delete',
            'platform.organizations.toggle_active',
            'platform.users.view',
            'platform.users.create',
            'platform.users.update',
            'platform.users.deactivate',
            'platform.impersonate',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Super Admin - full access
        Role::create(['name' => 'super_admin'])
            ->givePermissionTo(Permission::all());

        // Org Admin - organization-level only (no platform permissions)
        Role::create(['name' => 'org_admin'])
            ->givePermissionTo(
                Permission::where('name', 'not like', 'platform.%')->get()
            );

        // Collaborator - event operations
        Role::create(['name' => 'collaborator'])
            ->givePermissionTo([
                'events.view',
                'participants.view',
                'participants.checkin',
                'speakers.view',
                'sponsors.view',
                'communities.view',
                'agenda.view',
                'checkin.perform',
                'checkin.print_badge',
            ]);

        // Participant
        Role::create(['name' => 'participant'])
            ->givePermissionTo([
                'events.view',
                'agenda.view',
                'networking.use',
            ]);

        // Speaker
        Role::create(['name' => 'speaker'])
            ->givePermissionTo([
                'events.view',
                'agenda.view',
                'networking.use',
            ]);

        // Sponsor
        Role::create(['name' => 'sponsor'])
            ->givePermissionTo([
                'events.view',
                'sponsors.view_leads',
                'agenda.view',
            ]);
    }
}
