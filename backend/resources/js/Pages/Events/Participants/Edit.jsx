import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Select from '@cloudscape-design/components/select';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import ConfirmModal from '@/Components/ConfirmModal';
import PhoneInput from '@/Components/PhoneInput';
import { getCountryOptions, getCityOptions, getPhoneCode, COUNTRY_PHONES } from '@/data/locations';

const ticketTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'student', label: 'Estudiante' },
];

const statusOptions = [
    { value: 'registered', label: 'Registrado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'attended', label: 'Asistido' },
    { value: 'cancelled', label: 'Cancelado' },
];

function parsePhone(fullPhone) {
    if (!fullPhone) return { code: '+593', number: '' };
    const sorted = [...COUNTRY_PHONES].sort((a, b) => b.code.length - a.code.length);
    for (const entry of sorted) {
        if (fullPhone.startsWith(entry.code)) {
            return { code: entry.code, number: fullPhone.slice(entry.code.length).trimStart() };
        }
    }
    return { code: '+593', number: fullPhone };
}

export default function ParticipantEdit({ event, participant }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const parsed = parsePhone(participant.phone);
    const [phoneCode, setPhoneCode] = useState(parsed.code);
    const [phoneNumber, setPhoneNumber] = useState(parsed.number);

    const { data, setData, put, processing, errors } = useForm({
        first_name: participant.first_name,
        last_name: participant.last_name,
        email: participant.email,
        phone: participant.phone || '',
        company: participant.company || '',
        job_title: participant.job_title || '',
        country: participant.country || '',
        city: participant.city || '',
        ticket_type: participant.ticket_type,
        status: participant.status,
        notes: participant.notes || '',
    });

    function submit(e) {
        e.preventDefault();
        data.phone = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : '';
        put(`/events/${event.id}/participants/${participant.id}`);
    }

    function deleteParticipant() {
        router.delete(`/events/${event.id}/participants/${participant.id}`);
    }

    const deleteButton = (
        <Button variant="normal" onClick={() => setShowDeleteModal(true)}>
            Eliminar participante
        </Button>
    );

    return (
        <EventLayout event={event}>
            <Head title={`Editar participante - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description={`Actualiza la informacion de ${participant.first_name} ${participant.last_name}.`}
                            actions={deleteButton}
                        >
                            Editar participante
                        </Header>
                    }
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button
                                variant="link"
                                onClick={() => router.visit(`/events/${event.id}/participants`)}
                            >
                                Cancelar
                            </Button>
                            <Button variant="primary" formAction="submit" loading={processing}>
                                Guardar cambios
                            </Button>
                        </SpaceBetween>
                    }
                >
                    <Container header={<Header variant="h2">Informacion del participante</Header>}>
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

                            <FormField label="Correo electronico" errorText={errors.email}>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={({ detail }) => setData('email', detail.value)}
                                />
                            </FormField>

                            <FormField label="Telefono" errorText={errors.phone}>
                                <PhoneInput
                                    phoneCode={phoneCode}
                                    phoneNumber={phoneNumber}
                                    onCodeChange={setPhoneCode}
                                    onNumberChange={setPhoneNumber}
                                    error={!!errors.phone}
                                />
                            </FormField>

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

                            <ColumnLayout columns={2}>
                                <FormField label="Pais" errorText={errors.country}>
                                    <Autosuggest
                                        value={data.country}
                                        onChange={({ detail }) => {
                                            const val = detail.value;
                                            const code = getPhoneCode(val);
                                            if (code) setPhoneCode(code);
                                            setData((prev) => ({
                                                ...prev,
                                                country: val,
                                                city: prev.country !== val ? '' : prev.city,
                                            }));
                                        }}
                                        options={getCountryOptions()}
                                        placeholder="Buscar pais..."
                                        enteredTextLabel={(v) => `Usar: "${v}"`}
                                        empty="Sin resultados"
                                    />
                                </FormField>
                                <FormField label="Ciudad" errorText={errors.city}>
                                    <Autosuggest
                                        value={data.city}
                                        onChange={({ detail }) => setData('city', detail.value)}
                                        options={getCityOptions(data.country)}
                                        placeholder="Buscar ciudad..."
                                        enteredTextLabel={(v) => `Usar: "${v}"`}
                                        empty="Sin resultados"
                                    />
                                </FormField>
                            </ColumnLayout>

                            <ColumnLayout columns={2}>
                                <FormField label="Tipo de entrada" errorText={errors.ticket_type}>
                                    <Select
                                        selectedOption={
                                            ticketTypeOptions.find((o) => o.value === data.ticket_type) ||
                                            ticketTypeOptions[0]
                                        }
                                        onChange={({ detail }) =>
                                            setData('ticket_type', detail.selectedOption.value)
                                        }
                                        options={ticketTypeOptions}
                                    />
                                </FormField>
                                <FormField label="Estado" errorText={errors.status}>
                                    <Select
                                        selectedOption={
                                            statusOptions.find((o) => o.value === data.status) ||
                                            statusOptions[0]
                                        }
                                        onChange={({ detail }) =>
                                            setData('status', detail.selectedOption.value)
                                        }
                                        options={statusOptions}
                                    />
                                </FormField>
                            </ColumnLayout>

                            <FormField label="Notas" errorText={errors.notes}>
                                <Textarea
                                    value={data.notes}
                                    onChange={({ detail }) => setData('notes', detail.value)}
                                    placeholder="Notas adicionales sobre el participante..."
                                    rows={3}
                                />
                            </FormField>

                            {participant.registration_code && (
                                <Box color="text-body-secondary" fontSize="body-s">
                                    Codigo de registro: <strong>{participant.registration_code}</strong>
                                </Box>
                            )}
                        </SpaceBetween>
                    </Container>
                </Form>
            </form>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar participante"
                message={`Eliminar a ${participant.first_name} ${participant.last_name}? Esta accion no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteParticipant}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
