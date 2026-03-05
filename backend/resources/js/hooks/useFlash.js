import { usePage } from '@inertiajs/react';

export function useFlash() {
    const { flash } = usePage().props;
    return {
        success: flash?.success ?? null,
        error: flash?.error ?? null,
    };
}
