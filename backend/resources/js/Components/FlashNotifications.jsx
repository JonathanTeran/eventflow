import { useState, useEffect } from 'react';
import Flashbar from '@cloudscape-design/components/flashbar';
import { useFlash } from '@/hooks/useFlash';

export default function FlashNotifications() {
    const { success, error } = useFlash();
    const [items, setItems] = useState([]);

    useEffect(() => {
        const newItems = [];
        if (success) {
            newItems.push({
                type: 'success',
                content: success,
                dismissible: true,
                dismissLabel: 'Cerrar',
                onDismiss: () => setItems((prev) => prev.filter((i) => i.id !== 'flash-success')),
                id: 'flash-success',
            });
        }
        if (error) {
            newItems.push({
                type: 'error',
                content: error,
                dismissible: true,
                dismissLabel: 'Cerrar',
                onDismiss: () => setItems((prev) => prev.filter((i) => i.id !== 'flash-error')),
                id: 'flash-error',
            });
        }
        setItems(newItems);
    }, [success, error]);

    if (!items.length) return null;

    return <Flashbar items={items} />;
}
