import { useRef, useState } from 'react';
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
import Toggle from '@cloudscape-design/components/toggle';
import Table from '@cloudscape-design/components/table';
import { formatDateTimeLocal } from '@/utils/formatters';
import LocationPicker from '@/Components/LocationPicker';

const registrationOptions = [
    { value: 'open', label: 'Abierto' },
    { value: 'invite', label: 'Solo por invitacion' },
];

export default function EventEdit({ event, scanTypes: initialScanTypes }) {
    const [scanTypes, setScanTypes] = useState(initialScanTypes || [
        { key: 'checkin', label: 'Check-in', enabled: true },
    ]);

    const { data, setData, put, processing, errors } = useForm({
        name: event.name,
        slug: event.slug,
        description: event.description || '',
        date_start: formatDateTimeLocal(event.date_start),
        date_end: formatDateTimeLocal(event.date_end),
        location: event.location || '',
        venue: event.venue || '',
        latitude: event.latitude || '',
        longitude: event.longitude || '',
        capacity: event.capacity || '',
        registration_type: event.registration_type,
        settings: {
            ...event.settings,
            scan_types: initialScanTypes || [
                { key: 'checkin', label: 'Check-in', enabled: true },
            ],
        },
    });

    const coverForm = useForm({ cover_image: null });
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    function submit(e) {
        e.preventDefault();
        put(`/events/${event.id}`);
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        coverForm.setData('cover_image', file);
    }

    function uploadCover() {
        coverForm.post(`/events/${event.id}/cover`, {
            forceFormData: true,
            onSuccess: () => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                coverForm.reset();
            },
        });
    }

    function updateScanTypes(newTypes) {
        setScanTypes(newTypes);
        setData('settings', { ...data.settings, scan_types: newTypes });
    }

    function addScanType() {
        const key = `custom_${Date.now()}`;
        updateScanTypes([...scanTypes, { key, label: '', enabled: true }]);
    }

    function removeScanType(index) {
        updateScanTypes(scanTypes.filter((_, i) => i !== index));
    }

    function updateScanType(index, field, value) {
        const updated = scanTypes.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        updateScanTypes(updated);
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Editar - ${event.name}`} />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Eventos', href: '/events' },
                        { text: event.name, href: `/events/${event.id}` },
                        { text: 'Editar', href: '#' },
                    ]}
                    onFollow={(e) => {
                        e.preventDefault();
                        router.visit(e.detail.href);
                    }}
                />

                <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                    <form onSubmit={submit}>
                        <Form
                            header={<Header variant="h1">Editar evento</Header>}
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button variant="link" onClick={() => router.visit(`/events/${event.id}`)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="primary" formAction="submit" loading={processing}>
                                        Guardar cambios
                                    </Button>
                                </SpaceBetween>
                            }
                        >
                            <SpaceBetween size="l">
                                <Container header={<Header variant="h2">Informacion del evento</Header>}>
                                    <SpaceBetween size="m">
                                        <FormField label="Nombre del evento" errorText={errors.name}>
                                            <Input
                                                value={data.name}
                                                onChange={({ detail }) => setData('name', detail.value)}
                                            />
                                        </FormField>
                                        <FormField label="Slug (URL)" errorText={errors.slug}>
                                            <Input
                                                value={data.slug}
                                                onChange={({ detail }) => setData('slug', detail.value)}
                                            />
                                        </FormField>
                                        <FormField label="Descripcion">
                                            <Textarea
                                                value={data.description}
                                                onChange={({ detail }) => setData('description', detail.value)}
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
                                            <FormField label="Ciudad / Ubicacion">
                                                <Input
                                                    value={data.location}
                                                    onChange={({ detail }) => setData('location', detail.value)}
                                                />
                                            </FormField>
                                            <FormField label="Lugar / Venue">
                                                <Input
                                                    value={data.venue}
                                                    onChange={({ detail }) => setData('venue', detail.value)}
                                                />
                                            </FormField>
                                        </ColumnLayout>

                                        <FormField label="Ubicacion en el Mapa" description="Selecciona el punto exacto donde se realizara el evento.">
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
                                            <FormField label="Capacidad">
                                                <Input
                                                    type="number"
                                                    value={String(data.capacity || '')}
                                                    onChange={({ detail }) => setData('capacity', detail.value)}
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

                                <Container
                                    header={
                                        <Header
                                            variant="h2"
                                            description="Configura los tipos de escaneo disponibles en el evento. El Check-in principal no puede ser eliminado."
                                            actions={
                                                <Button iconName="add-plus" onClick={addScanType}>
                                                    Agregar tipo de escaneo
                                                </Button>
                                            }
                                        >
                                            Configuracion de escaneos
                                        </Header>
                                    }
                                >
                                    <Table
                                        items={scanTypes}
                                        columnDefinitions={[
                                            {
                                                id: 'enabled',
                                                header: 'Activo',
                                                width: 100,
                                                cell: (item, index) => (
                                                    <Toggle
                                                        checked={item.enabled}
                                                        onChange={({ detail }) => {
                                                            const idx = scanTypes.indexOf(item);
                                                            updateScanType(idx, 'enabled', detail.checked);
                                                        }}
                                                    />
                                                ),
                                            },
                                            {
                                                id: 'key',
                                                header: 'Clave',
                                                width: 200,
                                                cell: (item) => (
                                                    <Box color={item.key === 'checkin' ? 'text-status-info' : undefined}>
                                                        {item.key}
                                                    </Box>
                                                ),
                                            },
                                            {
                                                id: 'label',
                                                header: 'Etiqueta',
                                                cell: (item) => {
                                                    const idx = scanTypes.indexOf(item);
                                                    return (
                                                        <Input
                                                            value={item.label}
                                                            onChange={({ detail }) => updateScanType(idx, 'label', detail.value)}
                                                            placeholder="Nombre del tipo"
                                                        />
                                                    );
                                                },
                                            },
                                            {
                                                id: 'actions',
                                                header: '',
                                                width: 80,
                                                cell: (item) => {
                                                    if (item.key === 'checkin') return null;
                                                    const idx = scanTypes.indexOf(item);
                                                    return (
                                                        <Button
                                                            variant="icon"
                                                            iconName="remove"
                                                            onClick={() => removeScanType(idx)}
                                                        />
                                                    );
                                                },
                                            },
                                        ]}
                                        empty={
                                            <Box textAlign="center" padding="l">
                                                No hay tipos de escaneo configurados.
                                            </Box>
                                        }
                                    />
                                </Container>
                            </SpaceBetween>
                        </Form>
                    </form>

                    <Container header={<Header variant="h2">Imagen de portada</Header>}>
                        <SpaceBetween size="m">
                            {previewUrl || event.cover_image_url ? (
                                <img
                                    src={previewUrl || event.cover_image_url}
                                    alt={event.name}
                                    style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 200 }}
                                />
                            ) : (
                                <Box textAlign="center" padding="l" color="text-body-secondary">
                                    Sin imagen de portada
                                </Box>
                            )}
                            <FormField constraintText="JPG, PNG, GIF. Max 4MB." errorText={coverForm.errors.cover_image}>
                                <SpaceBetween size="xs">
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
                                    {previewUrl && (
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            loading={coverForm.processing}
                                            onClick={uploadCover}
                                        >
                                            Subir imagen
                                        </Button>
                                    )}
                                </SpaceBetween>
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </Grid>
            </SpaceBetween>
        </AuthenticatedLayout>
    );
}
