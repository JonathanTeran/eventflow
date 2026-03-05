<?php

namespace App\Traits;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            if (! auth()->check()) {
                return;
            }

            $user = auth()->user();

            // If impersonating, use the impersonated org
            $impersonatingOrgId = session('impersonating_organization_id');
            if ($impersonatingOrgId) {
                $builder->where(
                    $builder->getModel()->getTable() . '.organization_id',
                    $impersonatingOrgId
                );
                return;
            }

            // Super admin without impersonation: don't apply scope
            if ($user->hasRole('super_admin')) {
                return;
            }

            // Normal user: scope to their org
            $builder->where(
                $builder->getModel()->getTable() . '.organization_id',
                $user->organization_id
            );
        });

        static::creating(function ($model) {
            if (! $model->organization_id && auth()->check()) {
                // Impersonation takes priority
                $impersonatingOrgId = session('impersonating_organization_id');
                if ($impersonatingOrgId) {
                    $model->organization_id = $impersonatingOrgId;
                    return;
                }

                $model->organization_id = auth()->user()->organization_id;
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function scopeForOrganization(Builder $query, string $organizationId): Builder
    {
        return $query->where('organization_id', $organizationId);
    }
}
