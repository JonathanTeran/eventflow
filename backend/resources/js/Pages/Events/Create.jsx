import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import LocationPicker from '@/Components/LocationPicker';

const registrationOptions = [
    { value: 'open', label: 'Abierto' },
    { value: 'invite', label: 'Solo por invitación' },
];

export default function EventCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        date_start: '',
        date_end: '',
        location: '',
        venue: '',
        latitude: '',
        longitude: '',
        capacity: '',
        registration_type: 'open',
        cover_image: null,
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Cleanup object URL on unmount to prevent memory leak
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        const slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setData('slug', slug);
    }, [data.name]);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setData('cover_image', file);
    }

    function submit(e) {
        e.preventDefault();
        post('/events', { forceFormData: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Crear evento" />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Eventos', href: '/events' },
                        { text: 'Crear evento', href: '#' },
                    ]}
                    onFollow={(e) => {
                        e.preventDefault();
                        router.visit(e.detail.href);
                    }}
                />

                <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                    <form onSubmit={submit}>
                        <Form
                            header={
                                <Header variant="h1" description="Completa la información para crear un nuevo evento.">
                                    Crear evento
                                </Header>
                            }
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button variant="link" onClick={() => router.visit('/events')}>
                                        Cancelar
                                    </Button>
                                    <Button variant="primary" formAction="submit" loading={processing}>
                                        Crear evento
                                    </Button>
                                </SpaceBetween>
                            }
                        >
                            <Container header={<Header variant="h2">Información del evento</Header>}>
                                <SpaceBetween size="m">
                                    <FormField label="Nombre del evento" errorText={errors.name}>
                                        <Input
                                            value={data.name}
                                            onChange={({ detail }) => setData('name', detail.value)}
                                            placeholder="Ej: DevFest Ecuador 2026"
                                        />
                                    </FormField>

                                    <FormField label="Slug (URL)" errorText={errors.slug}>
                                        <Input
                                            value={data.slug}
                                            onChange={({ detail }) => setData('slug', detail.value)}
                                        />
                                    </FormField>

                                    <FormField label="Descripción" errorText={errors.description}>
                                        <Textarea
                                            value={data.description}
                                            onChange={({ detail }) => setData('description', detail.value)}
                                            placeholder="Describe tu evento..."
                                            rows={4}
                                        />
                                    </FormField>

                                    <ColumnLayout columns={2}>
                                        <FormField label="Fecha y hora de inicio" errorText={errors.date_start}>
                                            <Input
                                                type="datetime-local"
                                                value={data.date_start}
                                                onChange={({ detail }) => setData('date_start', detail.value)}
                                            />
                                        </FormField>
                                        <FormField label="Fecha y hora de fin" errorText={errors.date_end}>
                                            <Input
                                                type="datetime-local"
                                                value={data.date_end}
                                                onChange={({ detail }) => setData('date_end', detail.value)}
                                            />
                                        </FormField>
                                    </ColumnLayout>

                                    <ColumnLayout columns={2}>
                                        <FormField label="Ciudad / Ubicación">
                                            <Input
                                                value={data.location}
                                                onChange={({ detail }) => setData('location', detail.value)}
                                                placeholder="Ej: Quito, Ecuador"
                                            />
                                        </FormField>
                                        <FormField label="Lugar / Venue">
                                            <Input
                                                value={data.venue}
                                                onChange={({ detail }) => setData('venue', detail.value)}
                                                placeholder="Ej: Centro de Convenciones"
                                            />
                                        </FormField>
                                    </ColumnLayout>

                                    <FormField label="Ubicación en el Mapa" description="Selecciona el punto exacto donde se realizará el evento.">
                                        <LocationPicker
                                            latitude={data.latitude}
                                            longitude={data.longitude}
                                            onChange={({ latitude, longitude }) => {
                                                setData('latitude', latitude);
                                                setData('longitude', longitude);
                                            }}
                                        />
                                    </FormField>

                                    <ColumnLayout columns={2}>
                                        <FormField label="Capacidad" errorText={errors.capacity}>
                                            <Input
                                                type="number"
                                                value={data.capacity}
                                                onChange={({ detail }) => setData('capacity', detail.value)}
                                                placeholder="Ej: 500"
                                            />
                                        </FormField>
                                        <FormField label="Tipo de registro">
                                            <Select
                                                selectedOption={registrationOptions.find((o) => o.value === data.registration_type)}
                                                onChange={({ detail }) => setData('registration_type', detail.selectedOption.value)}
                                                options={registrationOptions}
                                            />
                                        </FormField>
                                    </ColumnLayout>
                                </SpaceBetween>
                            </Container>
                        </Form>
                    </form>

                    <Container header={<Header variant="h2">Imagen de portada</Header>}>
                        <SpaceBetween size="m">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 200 }}
                                />
                            ) : (
                                <Box textAlign="center" padding="l" color="text-body-secondary">
                                    Sin imagen seleccionada
                                </Box>
                            )}
                            <FormField constraintText="JPG, PNG, GIF. Máx 4MB." errorText={errors.cover_image}>
                                <Button variant="normal" iconName="upload" fullWidth onClick={() => fileInputRef.current.click()}>
                                    Seleccionar imagen
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </Grid>
            </SpaceBetween>
        </AuthenticatedLayout >
    );
}
