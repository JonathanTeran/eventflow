import { useEffect } from 'react';
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

export default function OrganizationCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        const slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setData('slug', slug);
    }, [data.name]);

    function submit(e) {
        e.preventDefault();
        post('/admin/organizations');
    }

    return (
        <AdminLayout>
            <Head title="Crear organización" />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Organizaciones', href: '/admin/organizations' },
                        { text: 'Crear organización', href: '#' },
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
                                description="Completa la información para crear una nueva organización."
                            >
                                Crear organización
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit('/admin/organizations')}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    formAction="submit"
                                    loading={processing}
                                >
                                    Crear organización
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
                                            placeholder="Ej: Empresa XYZ"
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
                                            placeholder="empresa-xyz"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField label="Email" errorText={errors.email}>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={({ detail }) => setData('email', detail.value)}
                                            placeholder="contacto@empresa.com"
                                        />
                                    </FormField>
                                    <FormField label="Teléfono" errorText={errors.phone}>
                                        <Input
                                            value={data.phone}
                                            onChange={({ detail }) => setData('phone', detail.value)}
                                            placeholder="+593 99 000 0000"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Sitio web" errorText={errors.website}>
                                    <Input
                                        value={data.website}
                                        onChange={({ detail }) => setData('website', detail.value)}
                                        placeholder="https://empresa.com"
                                    />
                                </FormField>

                                <FormField label="Dirección" errorText={errors.address}>
                                    <Textarea
                                        value={data.address}
                                        onChange={({ detail }) => setData('address', detail.value)}
                                        placeholder="Av. Principal 123, Ciudad"
                                        rows={2}
                                    />
                                </FormField>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) => setData('description', detail.value)}
                                        placeholder="Descripción de la organización..."
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
        </AdminLayout>
    );
}
