import { useState } from 'react';
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
import Box from '@cloudscape-design/components/box';
import ConfirmModal from '@/Components/ConfirmModal';

export default function UserEdit({ user, organizations, roles }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const orgOptions = [
        { value: '', label: 'Sin organización' },
        ...(organizations || []).map((o) => ({ value: o.id, label: o.name })),
    ];

    const roleOptions = (roles || []).map((r) => ({ value: r, label: r }));

    const currentRole = user.roles?.[0]?.name ?? roles?.[0] ?? 'org_admin';
    const currentOrgId = user.organization_id ?? '';

    const { data, setData, put, processing, errors } = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: currentRole,
        organization_id: currentOrgId,
    });

    const selectedRoleOption =
        roleOptions.find((o) => o.value === data.role) || roleOptions[0];
    const selectedOrgOption =
        orgOptions.find((o) => o.value === data.organization_id) || orgOptions[0];

    function submit(e) {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    }

    function deleteUser() {
        router.delete(`/admin/users/${user.id}`);
    }

    const isSuperAdmin = user.roles?.some((r) => r.name === 'super_admin');

    return (
        <AdminLayout>
            <Head title={`Editar - ${user.first_name} ${user.last_name}`} />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Usuarios', href: '/admin/users' },
                        {
                            text: `${user.first_name} ${user.last_name}`,
                            href: '#',
                        },
                        { text: 'Editar', href: '#' },
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
                                description={user.email}
                            >
                                Editar usuario
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                {!isSuperAdmin && (
                                    <Button
                                        variant="normal"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        Eliminar usuario
                                    </Button>
                                )}
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
                                    Guardar cambios
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
                                        />
                                    </FormField>
                                    <FormField label="Apellido" errorText={errors.last_name}>
                                        <Input
                                            value={data.last_name}
                                            onChange={({ detail }) =>
                                                setData('last_name', detail.value)
                                            }
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Email" errorText={errors.email}>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={({ detail }) => setData('email', detail.value)}
                                    />
                                </FormField>

                                <ColumnLayout columns={2}>
                                    <FormField
                                        label="Nueva contraseña"
                                        description="Dejar en blanco para mantener la actual"
                                        errorText={errors.password}
                                    >
                                        <Input
                                            type="password"
                                            value={data.password}
                                            onChange={({ detail }) =>
                                                setData('password', detail.value)
                                            }
                                            placeholder="••••••••"
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
                                            placeholder="••••••••"
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
                                                setData(
                                                    'organization_id',
                                                    detail.selectedOption.value
                                                )
                                            }
                                            options={orgOptions}
                                        />
                                    </FormField>
                                </ColumnLayout>

                                {user.deleted_at && (
                                    <Box color="text-status-warning">
                                        Esta cuenta está desactivada (soft-deleted).
                                    </Box>
                                )}
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>
            </SpaceBetween>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario '${user.first_name} ${user.last_name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteUser}
                onCancel={() => setShowDeleteModal(false)}
            />
        </AdminLayout>
    );
}
