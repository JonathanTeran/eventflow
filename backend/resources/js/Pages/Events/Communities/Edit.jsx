import { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import ConfirmModal from '@/Components/ConfirmModal';

export default function CommunityEdit({ event, community }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: community.name || '',
        url: community.url || '',
        description: community.description || '',
    });

    const logoForm = useForm({ logo: null });
    const fileInputRef = useRef(null);

    function submit(e) {
        e.preventDefault();
        put(`/events/${event.id}/communities/${community.id}`);
    }

    function uploadLogo(e) {
        const file = e.target.files[0];
        if (!file) return;
        router.post(`/events/${event.id}/communities/${community.id}/logo`, { logo: file }, {
            forceFormData: true,
            onError: (errors) => logoForm.setError(errors),
        });
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/communities/${community.id}`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Editar comunidad - ${community.name}`} />

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <form onSubmit={submit}>
                    <Form
                        header={
                            <Header variant="h1">
                                Editar comunidad
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit(`/events/${event.id}/communities`)}
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary" formAction="submit" loading={processing}>
                                    Guardar cambios
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <Container header={<Header variant="h2">Información de la comunidad</Header>}>
                            <SpaceBetween size="m">
                                <FormField label="Nombre de la comunidad" errorText={errors.name}>
                                    <Input
                                        value={data.name}
                                        onChange={({ detail }) => setData('name', detail.value)}
                                    />
                                </FormField>

                                <FormField label="URL / Sitio web" errorText={errors.url}>
                                    <Input
                                        value={data.url}
                                        onChange={({ detail }) => setData('url', detail.value)}
                                        type="url"
                                    />
                                </FormField>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) => setData('description', detail.value)}
                                        rows={3}
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>

                <SpaceBetween size="l">
                    {/* Logo upload */}
                    <Container header={<Header variant="h2">Logo</Header>}>
                        <SpaceBetween size="m">
                            {community.logo_url ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src={community.logo_url}
                                        alt={community.name}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: 120,
                                            objectFit: 'contain',
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            ) : (
                                <Box textAlign="center" padding="l" color="text-body-secondary">
                                    Sin logo
                                </Box>
                            )}
                            <Button
                                variant="normal"
                                iconName="upload"
                                fullWidth
                                loading={logoForm.processing}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {community.logo_url ? 'Cambiar logo' : 'Subir logo'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={uploadLogo}
                            />
                            {logoForm.errors.logo && (
                                <Box color="text-status-error">{logoForm.errors.logo}</Box>
                            )}
                        </SpaceBetween>
                    </Container>

                    {/* Danger zone */}
                    <Container header={<Header variant="h2">Zona de peligro</Header>}>
                        <SpaceBetween size="s">
                            <Box color="text-body-secondary">
                                Esta acción no se puede deshacer.
                            </Box>
                            <Button
                                variant="normal"
                                fullWidth
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Eliminar comunidad
                            </Button>
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            </Grid>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar comunidad"
                message={`¿Estás seguro de que deseas eliminar la comunidad '${community.name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
