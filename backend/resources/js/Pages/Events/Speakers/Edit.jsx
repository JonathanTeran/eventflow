import { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
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
import ConfirmModal from '@/Components/ConfirmModal';

const speakerStatusOptions = [
    { value: 'invited', label: 'Invitado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'declined', label: 'Declinado' },
];

export default function SpeakerEdit({ event, speaker }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        first_name: speaker.first_name,
        last_name: speaker.last_name,
        email: speaker.email,
        phone: speaker.phone || '',
        company: speaker.company || '',
        job_title: speaker.job_title || '',
        status: speaker.status,
        bio: speaker.bio || '',
        social_links: {
            twitter: speaker.social_links?.twitter || '',
            linkedin: speaker.social_links?.linkedin || '',
            website: speaker.social_links?.website || '',
        },
    });

    const photoForm = useForm({ photo: null });
    const fileInputRef = useRef(null);

    function submit(e) {
        e.preventDefault();
        put(`/events/${event.id}/speakers/${speaker.id}`);
    }

    function uploadPhoto(e) {
        const file = e.target.files[0];
        if (!file) return;
        photoForm.setData('photo', file);
        photoForm.post(`/events/${event.id}/speakers/${speaker.id}/photo`, {
            forceFormData: true,
        });
        e.target.value = '';
    }

    function deleteSpeaker() {
        router.delete(`/events/${event.id}/speakers/${speaker.id}`);
    }

    const deleteButton = (
        <Button variant="normal" onClick={() => setShowDeleteModal(true)}>
            Eliminar speaker
        </Button>
    );

    const initials = `${speaker.first_name?.[0] || ''}${speaker.last_name?.[0] || ''}`;

    return (
        <EventLayout event={event}>
            <Head title={`Editar speaker - ${event.name}`} />

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <form onSubmit={submit}>
                    <Form
                        header={
                            <Header
                                variant="h1"
                                description={`Actualiza la información de ${speaker.first_name} ${speaker.last_name}.`}
                                actions={deleteButton}
                            >
                                Editar speaker
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit(`/events/${event.id}/speakers`)}
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary" formAction="submit" loading={processing}>
                                    Guardar cambios
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <SpaceBetween size="l">
                            <Container header={<Header variant="h2">Información personal</Header>}>
                                <SpaceBetween size="m">
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

                                    <ColumnLayout columns={2}>
                                        <FormField label="Correo electrónico" errorText={errors.email}>
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

                                    <ColumnLayout columns={2}>
                                        <FormField label="Empresa" errorText={errors.company}>
                                            <Input
                                                value={data.company}
                                                onChange={({ detail }) => setData('company', detail.value)}
                                            />
                                        </FormField>
                                        <FormField label="Cargo" errorText={errors.job_title}>
                                            <Input
                                                value={data.job_title}
                                                onChange={({ detail }) => setData('job_title', detail.value)}
                                            />
                                        </FormField>
                                    </ColumnLayout>

                                    <FormField label="Estado" errorText={errors.status}>
                                        <Select
                                            selectedOption={
                                                speakerStatusOptions.find((o) => o.value === data.status) ||
                                                speakerStatusOptions[0]
                                            }
                                            onChange={({ detail }) =>
                                                setData('status', detail.selectedOption.value)
                                            }
                                            options={speakerStatusOptions}
                                        />
                                    </FormField>

                                    <FormField label="Biografía" errorText={errors.bio}>
                                        <Textarea
                                            value={data.bio}
                                            onChange={({ detail }) => setData('bio', detail.value)}
                                            rows={4}
                                        />
                                    </FormField>
                                </SpaceBetween>
                            </Container>

                            <Container header={<Header variant="h2">Redes sociales</Header>}>
                                <SpaceBetween size="m">
                                    <ColumnLayout columns={2}>
                                        <FormField
                                            label="Twitter / X"
                                            errorText={errors['social_links.twitter']}
                                        >
                                            <Input
                                                value={data.social_links.twitter}
                                                onChange={({ detail }) =>
                                                    setData('social_links', {
                                                        ...data.social_links,
                                                        twitter: detail.value,
                                                    })
                                                }
                                                placeholder="https://twitter.com/..."
                                            />
                                        </FormField>
                                        <FormField
                                            label="LinkedIn"
                                            errorText={errors['social_links.linkedin']}
                                        >
                                            <Input
                                                value={data.social_links.linkedin}
                                                onChange={({ detail }) =>
                                                    setData('social_links', {
                                                        ...data.social_links,
                                                        linkedin: detail.value,
                                                    })
                                                }
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </FormField>
                                    </ColumnLayout>
                                    <FormField
                                        label="Sitio web"
                                        errorText={errors['social_links.website']}
                                    >
                                        <Input
                                            value={data.social_links.website}
                                            onChange={({ detail }) =>
                                                setData('social_links', {
                                                    ...data.social_links,
                                                    website: detail.value,
                                                })
                                            }
                                            placeholder="https://..."
                                        />
                                    </FormField>
                                </SpaceBetween>
                            </Container>
                        </SpaceBetween>
                    </Form>
                </form>

                {/* Sidebar - Photo */}
                <Container header={<Header variant="h2">Foto del speaker</Header>}>
                    <SpaceBetween size="m">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            {speaker.photo_url ? (
                                <img
                                    src={speaker.photo_url}
                                    alt={`${speaker.first_name} ${speaker.last_name}`}
                                    style={{
                                        width: 128,
                                        height: 128,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 128,
                                        height: 128,
                                        borderRadius: '50%',
                                        backgroundColor: '#e8eaf6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                        color: '#3f51b5',
                                    }}
                                >
                                    {initials}
                                </div>
                            )}

                            <Button
                                variant="normal"
                                iconName="upload"
                                loading={photoForm.processing}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {speaker.photo_url ? 'Cambiar foto' : 'Subir foto'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={uploadPhoto}
                            />

                            {photoForm.errors.photo && (
                                <Box color="text-status-error" fontSize="body-s">
                                    {photoForm.errors.photo}
                                </Box>
                            )}

                            <Box color="text-body-secondary" fontSize="body-s" textAlign="center">
                                Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 2MB.
                            </Box>
                        </div>
                    </SpaceBetween>
                </Container>
            </Grid>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar speaker"
                message={`¿Eliminar a ${speaker.first_name} ${speaker.last_name}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteSpeaker}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
