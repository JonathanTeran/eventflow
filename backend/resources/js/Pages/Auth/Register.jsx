import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        organization_name: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <GuestLayout>
            <Head title="Registrar organización" />

            <SpaceBetween size="l">
                <div>
                    <Box variant="h1" fontSize="heading-xl">Crea tu cuenta</Box>
                    <Box variant="p" color="text-body-secondary">
                        Registra tu organización y comienza a gestionar eventos.
                    </Box>
                </div>

                <form onSubmit={submit}>
                    <Form>
                        <SpaceBetween size="m">
                            <FormField
                                label="Nombre de la organización"
                                errorText={errors.organization_name}
                            >
                                <Input
                                    value={data.organization_name}
                                    onChange={({ detail }) => setData('organization_name', detail.value)}
                                    placeholder="Ej: TechConf Ecuador"
                                    autoFocus
                                />
                            </FormField>

                            <ColumnLayout columns={2}>
                                <FormField label="Nombre" errorText={errors.first_name}>
                                    <Input
                                        value={data.first_name}
                                        onChange={({ detail }) => setData('first_name', detail.value)}
                                    />
                                </FormField>
                                <FormField label="Apellido" errorText={errors.last_name}>
                                    <Input
                                        value={data.last_name}
                                        onChange={({ detail }) => setData('last_name', detail.value)}
                                    />
                                </FormField>
                            </ColumnLayout>

                            <FormField
                                label="Correo electrónico"
                                errorText={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={({ detail }) => setData('email', detail.value)}
                                    placeholder="tu@email.com"
                                />
                            </FormField>

                            <FormField
                                label="Contraseña"
                                errorText={errors.password}
                            >
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={({ detail }) => setData('password', detail.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </FormField>

                            <FormField label="Confirmar contraseña">
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={({ detail }) => setData('password_confirmation', detail.value)}
                                    placeholder="Repite tu contraseña"
                                />
                            </FormField>

                            <Button
                                variant="primary"
                                formAction="submit"
                                fullWidth
                                loading={processing}
                            >
                                Crear cuenta
                            </Button>

                            <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login">Iniciar sesión</Link>
                            </Box>
                        </SpaceBetween>
                    </Form>
                </form>
            </SpaceBetween>
        </GuestLayout>
    );
}
