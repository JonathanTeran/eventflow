import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';

export default function ConfirmModal({
    visible,
    title = 'Confirmar acción',
    message = '¿Estás seguro de que deseas continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false,
    onConfirm,
    onCancel,
}) {
    return (
        <Modal
            visible={visible}
            onDismiss={onCancel}
            header={title}
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button
                            variant={danger ? 'primary' : 'primary'}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </SpaceBetween>
                </Box>
            }
        >
            {danger ? (
                <Alert type="warning">{message}</Alert>
            ) : (
                <Box>{message}</Box>
            )}
        </Modal>
    );
}
