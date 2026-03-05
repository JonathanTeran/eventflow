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

export default function SponsorCreate({ event, sponsorLevels }) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        sponsor_level_id: '',
        description: '',
        status: 'prospect',
        amount_paid: '',
    });

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
        post(`/events/${event.id}/sponsors`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Agregar sponsor - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description="Completa la información del sponsor para este evento."
                        >
                            Agregar sponsor
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
                                Guardar sponsor
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
                                        placeholder="Ej: Acme Corp"
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
                                    placeholder="Descripción del sponsor..."
                                    rows={3}
                                />
                            </FormField>

                            <FormField label="Sitio web" errorText={errors.website}>
                                <Input
                                    value={data.website}
                                    onChange={({ detail }) => setData('website', detail.value)}
                                    placeholder="https://www.ejemplo.com"
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
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </FormField>

                                <FormField label="Teléfono de contacto" errorText={errors.contact_phone}>
                                    <Input
                                        value={data.contact_phone}
                                        onChange={({ detail }) => setData('contact_phone', detail.value)}
                                        placeholder="Ej: +593 99 999 9999"
                                        type="tel"
                                    />
                                </FormField>
                            </ColumnLayout>

                            <FormField label="Email de contacto" errorText={errors.contact_email}>
                                <Input
                                    value={data.contact_email}
                                    onChange={({ detail }) => setData('contact_email', detail.value)}
                                    placeholder="contacto@empresa.com"
                                    type="email"
                                />
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </Form>
            </form>
        </EventLayout>
    );
}
