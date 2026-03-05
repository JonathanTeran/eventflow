import { router } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import Flashbar from '@cloudscape-design/components/flashbar';

export default function ImpersonationBanner() {
    const { impersonation } = useAuth();

    if (!impersonation) return null;

    function stopImpersonating() {
        router.delete('/admin/impersonate');
    }

    return (
        <Flashbar
            items={[
                {
                    type: 'warning',
                    content: (
                        <>
                            Operando como <strong>{impersonation.organization_name}</strong>
                        </>
                    ),
                    action: (
                        <button
                            onClick={stopImpersonating}
                            style={{
                                background: 'none',
                                border: '1px solid currentColor',
                                borderRadius: '4px',
                                padding: '4px 12px',
                                cursor: 'pointer',
                                color: 'inherit',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            Salir
                        </button>
                    ),
                    dismissible: false,
                    id: 'impersonation',
                },
            ]}
        />
    );
}
