<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Super admin without impersonation: redirect to admin panel
        if ($user->hasRole('super_admin') && ! session()->has('impersonating_organization_id')) {
            return redirect()->route('admin.dashboard');
        }

        // Regular user without organization
        if (! $user->organization_id && ! session()->has('impersonating_organization_id')) {
            abort(403, 'No perteneces a ninguna organización.');
        }

        return $next($request);
    }
}
