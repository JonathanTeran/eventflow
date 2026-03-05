import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';

export default function UserCreate({ organizations, roles }) {
    const orgOptions = [
        { value: '', label: 'Sin organización' },
        ...(organizations || []).map((o) => ({ value: o.id, label: o.name })),
    ];

    const roleOptions = (roles || []).map((r) => ({ value: r, label: r }));

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles?.[0] || 'org_admin',
        organization_id: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/users');
    }

    const selectedRoleOption = roleOptions.find((o) => o.value === data.role) || roleOptions[0];
    const selectedOrgOption = orgOptions.find((o) => o.value === data.organization_id) || orgOptions[0];

    return (
        <AdminLayout>
            <Head title="Crear usuario" />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Usuarios', href: '/admin/users' },
                        { text: 'Crear usuario', href: '#' },
                    ]}
                    onFollow={(e) => {
                        e.preventDefault();
                        router.visit(e.detail.href);
                    }}
                />

                <form onSubmit={submit}>
                    <Form
                        header={
                            <Header
                                variant="h1"
                                description="Completa la información para crear un nuevo usuario."
                            >
                                Crear usuario
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit('/admin/users')}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    formAction="submit"
                                    loading={processing}
                                >
                                    Crear usuario
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <Container header={<Header variant="h2">Información del usuario</Header>}>
                            <SpaceBetween size="m">
                                <ColumnLayout columns={2}>
                                    <FormField label="Nombre" errorText={errors.first_name}>
                                        <Input
                                            value={data.first_name}
                                            onChange={({ detail }) =>
                                                setData('first_name', detail.value)
                                            }
                                            placeholder="Juan"
                                        />
                                    </FormField>
                                    <FormField label="Apellido" errorText={errors.last_name}>
                                        <Input
                                            value={data.last_name}
                                            onChange={({ detail }) =>
                                                setData('last_name', detail.value)
                                            }
                                            placeholder="Pérez"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Email" errorText={errors.email}>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={({ detail }) => setData('email', detail.value)}
                                        placeholder="usuario@ejemplo.com"
                                    />
                                </FormField>

                                <ColumnLayout columns={2}>
                                    <FormField label="Contraseña" errorText={errors.password}>
                                        <Input
                                            type="password"
                                            value={data.password}
                                            onChange={({ detail }) =>
                                                setData('password', detail.value)
                                            }
                                        />
                                    </FormField>
                                    <FormField
                                        label="Confirmar contraseña"
                                        errorText={errors.password_confirmation}
                                    >
                                        <Input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={({ detail }) =>
                                                setData('password_confirmation', detail.value)
                                            }
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField label="Rol" errorText={errors.role}>
                                        <Select
                                            selectedOption={selectedRoleOption}
                                            onChange={({ detail }) =>
                                                setData('role', detail.selectedOption.value)
                                            }
                                            options={roleOptions}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Organización"
                                        description="Opcional para super admin"
                                        errorText={errors.organization_id}
                                    >
                                        <Select
                                            selectedOption={selectedOrgOption}
                                            onChange={({ detail }) =>
                                                setData('organization_id', detail.selectedOption.value)
                                            }
                                            options={orgOptions}
                                        />
                                    </FormField>
                                </ColumnLayout>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>
            </SpaceBetween>
        </AdminLayout>
    );
}
