<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function edit(): Response
    {
        $organization = auth()->user()->organization;

        return Inertia::render('Organizations/Edit', [
            'organization' => $organization,
        ]);
    }

    public function update(Request $request)
    {
        $organization = auth()->user()->organization;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:organizations,slug,' . $organization->id],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'primary_color' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $organization->update($validated);

        return back()->with('success', 'Organización actualizada correctamente.');
    }

    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        $organization = auth()->user()->organization;

        $path = $request->file('logo')->store(
            "organizations/{$organization->id}",
            'public'
        );

        $organization->update(['logo_path' => $path]);

        return back()->with('success', 'Logo actualizado correctamente.');
    }
}
