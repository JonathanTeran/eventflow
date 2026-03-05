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
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import ConfirmModal from '@/Components/ConfirmModal';

export default function AgendaEdit({ event, agendaItem, speakers }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        title: agendaItem.title || '',
        description: agendaItem.description || '',
        date: agendaItem.date ? agendaItem.date.slice(0, 10) : '',
        start_time: agendaItem.start_time || '',
        end_time: agendaItem.end_time || '',
        speaker_id: agendaItem.speaker_id ? String(agendaItem.speaker_id) : '',
        location_detail: agendaItem.location_detail || '',
        type: agendaItem.type || 'talk',
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

    function submit(e) {
        e.preventDefault();
        put(`/events/${event.id}/agenda/${agendaItem.id}`);
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/agenda/${agendaItem.id}`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Editar sesión - ${agendaItem.title}`} />

            <SpaceBetween size="l">
                <form onSubmit={submit}>
                    <Form
                        header={
                            <Header variant="h1">
                                Editar sesión
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
                                    Guardar cambios
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
                                    />
                                </FormField>

                                <FormField label="Descripción" errorText={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={({ detail }) =>
                                            setData('description', detail.value)
                                        }
                                        rows={3}
                                    />
                                </FormField>

                                <ColumnLayout columns={3}>
                                    <FormField label="Fecha" errorText={errors.date}>
                                        <Input
                                            type="date"
                                            value={data.date}
                                            onChange={({ detail }) => setData('date', detail.value)}
                                        />
                                    </FormField>

                                    <FormField label="Hora de inicio" errorText={errors.start_time}>
                                        <Input
                                            type="time"
                                            value={data.start_time}
                                            onChange={({ detail }) =>
                                                setData('start_time', detail.value)
                                            }
                                        />
                                    </FormField>

                                    <FormField label="Hora de fin" errorText={errors.end_time}>
                                        <Input
                                            type="time"
                                            value={data.end_time}
                                            onChange={({ detail }) =>
                                                setData('end_time', detail.value)
                                            }
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
                                        onChange={({ detail }) =>
                                            setData('location_detail', detail.value)
                                        }
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>
                    </Form>
                </form>

                {/* Danger zone */}
                <Container header={<Header variant="h2">Zona de peligro</Header>}>
                    <SpaceBetween size="s">
                        <Box color="text-body-secondary">Esta acción no se puede deshacer.</Box>
                        <Button
                            variant="normal"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Eliminar sesión
                        </Button>
                    </SpaceBetween>
                </Container>
            </SpaceBetween>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar sesión"
                message={`¿Estás seguro de que deseas eliminar la sesión '${agendaItem.title}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
