<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    public function start(Request $request, Organization $organization): RedirectResponse
    {
        if (! $organization->is_active) {
            return back()->with('error', 'No se puede impersonar una organización inactiva.');
        }

        $request->session()->put('impersonating_organization_id', $organization->id);
        $request->session()->put('impersonating_organization_name', $organization->name);

        return redirect()->route('dashboard')
            ->with('success', "Ahora estás operando como {$organization->name}.");
    }

    public function stop(Request $request): RedirectResponse
    {
        $request->session()->forget([
            'impersonating_organization_id',
            'impersonating_organization_name',
        ]);

        return redirect()->route('admin.dashboard')
            ->with('success', 'Has dejado de impersonar la organización.');
    }
}
