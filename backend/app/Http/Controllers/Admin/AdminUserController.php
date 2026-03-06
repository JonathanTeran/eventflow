<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withTrashed()
            ->with(['organization:id,name', 'roles:id,name']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        if ($organizationId = $request->input('organization_id')) {
            $query->where('organization_id', $organizationId);
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'organization_id']),
            'organizations' => Organization::orderBy('name')->get(['id', 'name']),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'organizations' => Organization::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'roles' => Role::where('name', '!=', 'super_admin')->orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create($request->safe()->except('role'));

        $user->assignRole($request->input('role'));

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(User $user): Response
    {
        $user->load('roles:id,name');

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'organizations' => Organization::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'roles' => Role::where('name', '!=', 'super_admin')->orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $data = collect($validated)->except(['role', 'password'])->toArray();

        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        $user->update($data);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->hasRole('super_admin')) {
            return back()->with('error', 'No se puede desactivar un super administrador.');
        }

        if ($user->trashed()) {
            $user->restore();
            return back()->with('success', 'Usuario reactivado exitosamente.');
        }

        $user->delete();

        return back()->with('success', 'Usuario desactivado exitosamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->hasRole('super_admin')) {
            return back()->with('error', 'No se puede eliminar un super administrador.');
        }

        \App\Models\ParticipantScan::where('scanned_by', $user->id)
            ->update(['scanned_by' => null]);

        $user->forceDelete();

        return back()->with('success', 'Usuario eliminado exitosamente.');
    }
}
