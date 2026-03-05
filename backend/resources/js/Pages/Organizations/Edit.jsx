import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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

export default function OrganizationEdit({ organization }) {
    const { data, setData, put, processing, errors } = useForm({
        name: organization.name || '',
        slug: organization.slug || '',
        description: organization.description || '',
        website: organization.website || '',
        phone: organization.phone || '',
        email: organization.email || '',
        address: organization.address || '',
    });

    function submit(e) {
        e.preventDefault();
        put('/organization');
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Editar organización - ${organization.name}`} />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Dashboard', href: '/dashboard' },
                        { text: 'Organización', href: '/organization' },
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
                                description="Actualiza la información de tu organización."
                            >
                                Editar organización
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit('/dashboard')}
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary" formAction="submit" loading={processing}>
                                    Guardar cambios
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <Container header={<Header variant="h2">Información general</Header>}>
                            <SpaceBetween size="m">
                                <ColumnLayout columns={2}>
                                    <FormField label="Nombre de la organización" errorText={errors.name}>
                                        <Input
                                            value={data.name}
                                            onChange={({ detail }) => setData('name', detail.value)}
                                            placeholder="Ej: Mi Empresa S.A."
                                        />
                                    </FormField>

                                    <FormField
                                        label="Slug (identificador en URL)"
                                        errorText={errors.slug}
                                        description="Solo letras minúsculas, números y guiones."
                                    >
                                        <Input
                                            value={data.slug}
                                            onChange={({ detail }) => setData('slug', detail.value)}
                                            placeholder="mi-empresa"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) => setData('description', detail.value)}
                                        placeholder="Describe tu organización..."
                                        rows={4}
                                    />
                                </FormField>

                                <FormField label="Sitio web" errorText={errors.website}>
                                    <Input
                                        value={data.website}
                                        onChange={({ detail }) => setData('website', detail.value)}
                                        placeholder="https://www.tuempresa.com"
                                        type="url"
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>

                        <Container header={<Header variant="h2">Información de contacto</Header>}>
                            <SpaceBetween size="m">
                                <ColumnLayout columns={2}>
                                    <FormField label="Teléfono" errorText={errors.phone}>
                                        <Input
                                            value={data.phone}
                                            onChange={({ detail }) => setData('phone', detail.value)}
                                            placeholder="Ej: +593 99 999 9999"
                                            type="tel"
                                        />
                                    </FormField>

                                    <FormField label="Email" errorText={errors.email}>
                                        <Input
                                            value={data.email}
                                            onChange={({ detail }) => setData('email', detail.value)}
                                            placeholder="contacto@tuempresa.com"
                                            type="email"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Dirección" errorText={errors.address}>
                                    <Textarea
                                        value={data.address}
                                        onChange={({ detail }) => setData('address', detail.value)}
                                        placeholder="Dirección física de la organización..."
                                        rows={2}
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>
            </SpaceBetween>
        </AuthenticatedLayout>
    );
}
