import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';
import Checkbox from '@cloudscape-design/components/checkbox';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    }

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            <SpaceBetween size="l">
                <div>
                    <Box variant="h1" fontSize="heading-xl">Iniciar sesión</Box>
                    <Box variant="p" color="text-body-secondary">
                        Ingresa tus credenciales para acceder a tu cuenta.
                    </Box>
                </div>

                <form onSubmit={submit}>
                    <Form>
                        <SpaceBetween size="m">
                            <FormField
                                label="Correo electrónico"
                                errorText={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={({ detail }) => setData('email', detail.value)}
                                    placeholder="tu@email.com"
                                    autoFocus
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
                                />
                            </FormField>

                            <Checkbox
                                checked={data.remember}
                                onChange={({ detail }) => setData('remember', detail.checked)}
                            >
                                Recordarme
                            </Checkbox>

                            <Button
                                variant="primary"
                                formAction="submit"
                                fullWidth
                                loading={processing}
                            >
                                Iniciar sesión
                            </Button>

                            <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
                                ¿No tienes cuenta?{' '}
                                <Link href="/register">Registrar organización</Link>
                            </Box>
                        </SpaceBetween>
                    </Form>
                </form>
            </SpaceBetween>
        </GuestLayout>
    );
}
