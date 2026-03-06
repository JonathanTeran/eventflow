import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Modal from '@cloudscape-design/components/modal';

const encryptionOptions = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: 'none', label: 'Ninguno' },
];

export default function Settings({ smtp, isConfigured }) {
    const [form, setForm] = useState({
        host: smtp.host || '',
        port: smtp.port || '587',
        username: smtp.username || '',
        password: smtp.password || '',
        encryption: encryptionOptions.find((o) => o.value === smtp.encryption) || encryptionOptions[0],
        from_address: smtp.from_address || '',
        from_name: smtp.from_name || '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [testModal, setTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testProcessing, setTestProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        router.put('/admin/settings', {
            ...form,
            encryption: form.encryption.value,
        }, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    }

    function handleTestSend() {
        setTestProcessing(true);

        router.post('/admin/settings/test-smtp', {
            email: testEmail,
        }, {
            onSuccess: () => {
                setTestProcessing(false);
                setTestModal(false);
                setTestEmail('');
            },
            onError: () => {
                setTestProcessing(false);
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="Configuracion" />

            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description="Configura los parametros de la plataforma."
                >
                    Configuracion
                </Header>

                <form onSubmit={handleSubmit}>
                    <Form
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                {isConfigured && (
                                    <Button
                                        variant="normal"
                                        onClick={() => setTestModal(true)}
                                        iconName="send"
                                    >
                                        Probar conexion
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    formAction="submit"
                                    loading={processing}
                                >
                                    Guardar configuracion
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <Container
                            header={
                                <Header
                                    variant="h2"
                                    description="Configura el servidor SMTP para el envio de correos electronicos."
                                    info={
                                        isConfigured
                                            ? <StatusIndicator type="success">Configurado</StatusIndicator>
                                            : <StatusIndicator type="warning">No configurado</StatusIndicator>
                                    }
                                >
                                    Servidor de correo (SMTP)
                                </Header>
                            }
                        >
                            <SpaceBetween size="l">
                                <ColumnLayout columns={2}>
                                    <FormField
                                        label="Host SMTP"
                                        errorText={errors.host}
                                    >
                                        <Input
                                            value={form.host}
                                            onChange={({ detail }) => setForm({ ...form, host: detail.value })}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Puerto"
                                        errorText={errors.port}
                                    >
                                        <Input
                                            value={form.port}
                                            onChange={({ detail }) => setForm({ ...form, port: detail.value })}
                                            placeholder="587"
                                            type="number"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField
                                        label="Usuario"
                                        errorText={errors.username}
                                    >
                                        <Input
                                            value={form.username}
                                            onChange={({ detail }) => setForm({ ...form, username: detail.value })}
                                            placeholder="usuario@ejemplo.com"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Contrasena"
                                        errorText={errors.password}
                                        constraintText="Deja vacio para mantener la contrasena actual."
                                    >
                                        <Input
                                            value={form.password}
                                            onChange={({ detail }) => setForm({ ...form, password: detail.value })}
                                            type="password"
                                            placeholder="••••••••"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField
                                    label="Encriptacion"
                                    errorText={errors.encryption}
                                >
                                    <Select
                                        selectedOption={form.encryption}
                                        onChange={({ detail }) => setForm({ ...form, encryption: detail.selectedOption })}
                                        options={encryptionOptions}
                                    />
                                </FormField>

                                <Alert type="info">
                                    Remitente: la direccion y nombre que apareceran como remitente en los correos enviados.
                                </Alert>

                                <ColumnLayout columns={2}>
                                    <FormField
                                        label="Correo remitente"
                                        errorText={errors.from_address}
                                    >
                                        <Input
                                            value={form.from_address}
                                            onChange={({ detail }) => setForm({ ...form, from_address: detail.value })}
                                            placeholder="noreply@midominio.com"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Nombre remitente"
                                        errorText={errors.from_name}
                                    >
                                        <Input
                                            value={form.from_name}
                                            onChange={({ detail }) => setForm({ ...form, from_name: detail.value })}
                                            placeholder="BuilderApp"
                                        />
                                    </FormField>
                                </ColumnLayout>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>
            </SpaceBetween>

            <Modal
                visible={testModal}
                onDismiss={() => setTestModal(false)}
                header="Probar conexion SMTP"
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setTestModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                loading={testProcessing}
                                onClick={handleTestSend}
                                disabled={!testEmail}
                            >
                                Enviar correo de prueba
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <FormField
                    label="Correo de destino"
                    description="Se enviara un correo de prueba a esta direccion para verificar la configuracion SMTP."
                >
                    <Input
                        value={testEmail}
                        onChange={({ detail }) => setTestEmail(detail.value)}
                        placeholder="tucorreo@ejemplo.com"
                        type="email"
                    />
                </FormField>
            </Modal>
        </AdminLayout>
    );
}
