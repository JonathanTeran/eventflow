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
import PhoneInput from '@/Components/PhoneInput';
import { getCountryOptions, getCityOptions, getPhoneCode } from '@/data/locations';

const ticketTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'student', label: 'Estudiante' },
];

export default function ParticipantCreate({ event }) {
    const [phoneCode, setPhoneCode] = useState('+593');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        country: 'Ecuador',
        city: '',
        ticket_type: 'general',
        notes: '',
    });

    function submit(e) {
        e.preventDefault();
        data.phone = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : '';
        post(`/events/${event.id}/participants`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Agregar participante - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description="Registra un nuevo participante para este evento."
                        >
                            Agregar participante
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
                                Registrar participante
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
                                        placeholder="Ej: Juan"
                                    />
                                </FormField>
                                <FormField label="Apellido" errorText={errors.last_name}>
                                    <Input
                                        value={data.last_name}
                                        onChange={({ detail }) => setData('last_name', detail.value)}
                                        placeholder="Ej: Perez"
                                    />
                                </FormField>
                            </ColumnLayout>

                            <FormField label="Correo electronico" errorText={errors.email}>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={({ detail }) => setData('email', detail.value)}
                                    placeholder="Ej: juan@empresa.com"
                                />
                            </FormField>

                            <FormField label="Telefono" errorText={errors.phone}>
                                <PhoneInput
                                    phoneCode={phoneCode}
                                    phoneNumber={phoneNumber}
                                    onCodeChange={setPhoneCode}
                                    onNumberChange={setPhoneNumber}
                                    error={!!errors.phone}
                                    placeholder="99 123 4567"
                                />
                            </FormField>

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
                                <FormField label="Empresa" errorText={errors.company}>
                                    <Input
                                        value={data.company}
                                        onChange={({ detail }) => setData('company', detail.value)}
                                        placeholder="Ej: Empresa S.A."
                                    />
                                </FormField>
                                <FormField label="Cargo" errorText={errors.job_title}>
                                    <Input
                                        value={data.job_title}
                                        onChange={({ detail }) => setData('job_title', detail.value)}
                                        placeholder="Ej: Desarrollador"
                                    />
                                </FormField>
                            </ColumnLayout>

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

                            <FormField label="Notas" errorText={errors.notes}>
                                <Textarea
                                    value={data.notes}
                                    onChange={({ detail }) => setData('notes', detail.value)}
                                    placeholder="Notas adicionales sobre el participante..."
                                    rows={3}
                                />
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </Form>
            </form>
        </EventLayout>
    );
}
