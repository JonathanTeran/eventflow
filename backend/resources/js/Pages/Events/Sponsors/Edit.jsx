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

export default function SponsorEdit({ event, sponsor, sponsorLevels }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        company_name: sponsor.company_name || '',
        contact_name: sponsor.contact_name || '',
        contact_email: sponsor.contact_email || '',
        contact_phone: sponsor.contact_phone || '',
        website: sponsor.website || '',
        sponsor_level_id: sponsor.sponsor_level_id ? String(sponsor.sponsor_level_id) : '',
        description: sponsor.description || '',
        status: sponsor.status || 'prospect',
        amount_paid: sponsor.amount_paid != null ? String(sponsor.amount_paid) : '',
    });

    const logoForm = useForm({ logo: null });
    const fileInputRef = useRef(null);

    const statusOptions = [
        { value: 'prospect', label: 'Prospecto' },
        { value: 'confirmed', label: 'Confirmado' },
        { value: 'paid', label: 'Pagado' },
    ];

    const levelOptions = sponsorLevels.map((l) => ({
        value: String(l.id),
        label: l.name,
    }));

    const selectedLevel =
        levelOptions.find((o) => o.value === String(data.sponsor_level_id)) || null;

    function submit(e) {
        e.preventDefault();
        put(`/events/${event.id}/sponsors/${sponsor.id}`);
    }

    function uploadLogo(e) {
        const file = e.target.files[0];
        if (!file) return;
        router.post(`/events/${event.id}/sponsors/${sponsor.id}/logo`, { logo: file }, {
            forceFormData: true,
            onError: (errors) => logoForm.setError(errors),
        });
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/sponsors/${sponsor.id}`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Editar sponsor - ${sponsor.company_name}`} />

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <form onSubmit={submit}>
                    <Form
                        header={
                            <Header variant="h1">
                                Editar sponsor
                            </Header>
                        }
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() => router.visit(`/events/${event.id}/sponsors`)}
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary" formAction="submit" loading={processing}>
                                    Guardar cambios
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        <Container header={<Header variant="h2">Información del sponsor</Header>}>
                            <SpaceBetween size="m">
                                <ColumnLayout columns={2}>
                                    <FormField label="Nombre del sponsor" errorText={errors.company_name}>
                                        <Input
                                            value={data.company_name}
                                            onChange={({ detail }) => setData('company_name', detail.value)}
                                        />
                                    </FormField>

                                    <FormField label="Nivel de sponsor" errorText={errors.sponsor_level_id}>
                                        <Select
                                            selectedOption={selectedLevel}
                                            onChange={({ detail }) =>
                                                setData('sponsor_level_id', detail.selectedOption.value)
                                            }
                                            options={levelOptions}
                                            placeholder="Selecciona un nivel"
                                            empty="No hay niveles disponibles"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) => setData('description', detail.value)}
                                        rows={3}
                                    />
                                </FormField>

                                <FormField label="Sitio web" errorText={errors.website}>
                                    <Input
                                        value={data.website}
                                        onChange={({ detail }) => setData('website', detail.value)}
                                        type="url"
                                    />
                                </FormField>

                                <ColumnLayout columns={2}>
                                    <FormField label="Estado" errorText={errors.status}>
                                        <Select
                                            selectedOption={statusOptions.find((o) => o.value === data.status) || null}
                                            onChange={({ detail }) => setData('status', detail.selectedOption.value)}
                                            options={statusOptions}
                                            placeholder="Selecciona un estado"
                                        />
                                    </FormField>

                                    <FormField label="Monto pagado" errorText={errors.amount_paid}>
                                        <Input
                                            value={data.amount_paid}
                                            onChange={({ detail }) => setData('amount_paid', detail.value)}
                                            placeholder="0.00"
                                            type="number"
                                            inputMode="decimal"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <Header variant="h3">Información de contacto</Header>

                                <ColumnLayout columns={2}>
                                    <FormField label="Nombre de contacto" errorText={errors.contact_name}>
                                        <Input
                                            value={data.contact_name}
                                            onChange={({ detail }) => setData('contact_name', detail.value)}
                                        />
                                    </FormField>

                                    <FormField label="Teléfono de contacto" errorText={errors.contact_phone}>
                                        <Input
                                            value={data.contact_phone}
                                            onChange={({ detail }) =>
                                                setData('contact_phone', detail.value)
                                            }
                                            type="tel"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <FormField label="Email de contacto" errorText={errors.contact_email}>
                                    <Input
                                        value={data.contact_email}
                                        onChange={({ detail }) => setData('contact_email', detail.value)}
                                        type="email"
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
                            {sponsor.logo_url ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src={sponsor.logo_url}
                                        alt={sponsor.company_name}
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
                                {sponsor.logo_url ? 'Cambiar logo' : 'Subir logo'}
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
                                Eliminar sponsor
                            </Button>
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            </Grid>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar sponsor"
                message={`¿Estás seguro de que deseas eliminar al sponsor '${sponsor.company_name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
