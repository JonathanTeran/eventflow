import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Checkbox from '@cloudscape-design/components/checkbox';
import Box from '@cloudscape-design/components/box';
import ConfirmModal from '@/Components/ConfirmModal';

export default function OrganizationEdit({ organization }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: organization.name,
        slug: organization.slug,
        email: organization.email ?? '',
        phone: organization.phone ?? '',
        website: organization.website ?? '',
        address: organization.address ?? '',
        description: organization.description ?? '',
        is_active: organization.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        put(`/admin/organizations/${organization.id}`);
    }

    function deleteOrganization() {
        router.delete(`/admin/organizations/${organization.id}`);
    }

    return (
        <AdminLayout>
            <Head title={`Editar - ${organization.name}`} />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Organizaciones', href: '/admin/organizations' },
                        { text: organization.name, href: `/admin/organizations/${organization.id}` },
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
                            <Header variant="h1" description={organization.name}>
                                Editar organización
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="normal"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Eliminar organización
                                </Button>
                                <Button
                                    variant="link"
                                    onClick={() =>
                                        router.visit(`/admin/organizations/${organization.id}`)
                                    }
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
                        <Container header={<Header variant="h2">Información de la organización</Header>}>
                            <SpaceBetween size="m">
                                <ColumnLayout columns={2}>
                                    <FormField label="Nombre" errorText={errors.name}>
                                        <Input
                                            value={data.name}
                                            onChange={({ detail }) => setData('name', detail.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Slug (URL)"
                                        errorText={errors.slug}
                                        description="Identificador único en la URL"
                                    >
                                        <Input
                                            value={data.slug}
                                            onChange={({ detail }) => setData('slug', detail.value)}
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField label="Email" errorText={errors.email}>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={({ detail }) => setData('email', detail.value)}
                                        />
                                    </FormField>
                                    <FormField label="Teléfono" errorText={errors.phone}>
                                        <Input
                                            value={data.phone}
                                            onChange={({ detail }) => setData('phone', detail.value)}
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Sitio web" errorText={errors.website}>
                                    <Input
                                        value={data.website}
                                        onChange={({ detail }) => setData('website', detail.value)}
                                        placeholder="https://"
                                    />
                                </FormField>

                                <FormField label="Dirección" errorText={errors.address}>
                                    <Textarea
                                        value={data.address}
                                        onChange={({ detail }) => setData('address', detail.value)}
                                        rows={2}
                                    />
                                </FormField>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) => setData('description', detail.value)}
                                        rows={3}
                                    />
                                </FormField>

                                <Checkbox
                                    checked={data.is_active}
                                    onChange={({ detail }) => setData('is_active', detail.checked)}
                                >
                                    Organización activa
                                </Checkbox>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>
            </SpaceBetween>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar organización"
                message={`¿Estás seguro de que deseas eliminar la organización '${organization.name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteOrganization}
                onCancel={() => setShowDeleteModal(false)}
            />
        </AdminLayout>
    );
}
