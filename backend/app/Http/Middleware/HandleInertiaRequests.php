<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $impersonatingOrgId = session('impersonating_organization_id');
        $impersonatingOrg = $impersonatingOrgId
            ? Organization::find($impersonatingOrgId)
            : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'photo_url' => $user->photo_url,
                    'organization' => $user->organization ? [
                        'id' => $user->organization->id,
                        'name' => $user->organization->name,
                        'slug' => $user->organization->slug,
                        'logo_url' => $user->organization->logo_url,
                    ] : null,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'is_super_admin' => $user->hasRole('super_admin'),
                ] : null,
            ],
            'impersonation' => $impersonatingOrg ? [
                'organization_id' => $impersonatingOrg->id,
                'organization_name' => $impersonatingOrg->name,
            ] : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
