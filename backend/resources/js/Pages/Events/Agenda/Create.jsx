import { Head, router, useForm } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import { extractDate } from '@/utils/formatters';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import DatePicker from '@cloudscape-design/components/date-picker';
import Textarea from '@cloudscape-design/components/textarea';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';

export default function AgendaCreate({ event, speakers }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        date: extractDate(event.date_start),
        start_time: '',
        end_time: '',
        speaker_id: '',
        location_detail: '',
        type: 'talk',
    });

    const typeOptions = [
        { value: 'talk', label: 'Charla' },
        { value: 'workshop', label: 'Taller' },
        { value: 'break', label: 'Descanso' },
        { value: 'networking', label: 'Networking' },
        { value: 'ceremony', label: 'Ceremonia' },
    ];

    const speakerOptions = [
        { value: '', label: 'Sin speaker asignado' },
        ...speakers.map((s) => ({
            value: String(s.id),
            label: `${s.first_name} ${s.last_name}`,
        })),
    ];

    const selectedSpeaker =
        speakerOptions.find((o) => o.value === String(data.speaker_id)) ||
        speakerOptions[0];

    const minDate = extractDate(event.date_start);
    const maxDate = extractDate(event.date_end);

    function isDateEnabled(date) {
        const pad = (n) => String(n).padStart(2, '0');
        const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        return (!minDate || d >= minDate) && (!maxDate || d <= maxDate);
    }

    function submit(e) {
        e.preventDefault();
        post(`/events/${event.id}/agenda`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Agregar sesión - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description="Completa la información para agregar una sesión a la agenda."
                        >
                            Agregar sesión
                        </Header>
                    }
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button
                                variant="link"
                                onClick={() => router.visit(`/events/${event.id}/agenda`)}
                            >
                                Cancelar
                            </Button>
                            <Button variant="primary" formAction="submit" loading={processing}>
                                Guardar sesión
                            </Button>
                        </SpaceBetween>
                    }
                >
                    <Container header={<Header variant="h2">Información de la sesión</Header>}>
                        <SpaceBetween size="m">
                            <FormField label="Título" errorText={errors.title}>
                                <Input
                                    value={data.title}
                                    onChange={({ detail }) => setData('title', detail.value)}
                                    placeholder="Ej: Keynote de apertura"
                                />
                            </FormField>

                            <FormField label="Descripción" errorText={errors.description}>
                                <Textarea
                                    value={data.description}
                                    onChange={({ detail }) => setData('description', detail.value)}
                                    placeholder="Descripción de la sesión..."
                                    rows={3}
                                />
                            </FormField>

                            <ColumnLayout columns={3}>
                                <FormField
                                    label="Fecha"
                                    errorText={errors.date}
                                    constraintText={minDate && maxDate && minDate !== maxDate ? `Entre ${minDate} y ${maxDate}` : ''}
                                >
                                    <DatePicker
                                        value={data.date}
                                        onChange={({ detail }) => setData('date', detail.value)}
                                        isDateEnabled={isDateEnabled}
                                        placeholder="YYYY/MM/DD"
                                        locale="es"
                                    />
                                </FormField>

                                <FormField label="Hora de inicio" errorText={errors.start_time}>
                                    <Input
                                        type="time"
                                        value={data.start_time}
                                        onChange={({ detail }) => setData('start_time', detail.value)}
                                    />
                                </FormField>

                                <FormField label="Hora de fin" errorText={errors.end_time}>
                                    <Input
                                        type="time"
                                        value={data.end_time}
                                        onChange={({ detail }) => setData('end_time', detail.value)}
                                    />
                                </FormField>
                            </ColumnLayout>

                            <ColumnLayout columns={2}>
                                <FormField label="Speaker" errorText={errors.speaker_id}>
                                    <Select
                                        selectedOption={selectedSpeaker}
                                        onChange={({ detail }) =>
                                            setData('speaker_id', detail.selectedOption.value)
                                        }
                                        options={speakerOptions}
                                        placeholder="Selecciona un speaker"
                                    />
                                </FormField>

                                <FormField label="Tipo de sesión" errorText={errors.type}>
                                    <Select
                                        selectedOption={typeOptions.find((o) => o.value === data.type) || null}
                                        onChange={({ detail }) => setData('type', detail.selectedOption.value)}
                                        options={typeOptions}
                                        placeholder="Selecciona un tipo"
                                    />
                                </FormField>
                            </ColumnLayout>

                            <FormField label="Lugar / Sala" errorText={errors.location_detail}>
                                <Input
                                    value={data.location_detail}
                                    onChange={({ detail }) => setData('location_detail', detail.value)}
                                    placeholder="Ej: Sala A, Auditorio principal"
                                />
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </Form>
            </form>
        </EventLayout>
    );
}
