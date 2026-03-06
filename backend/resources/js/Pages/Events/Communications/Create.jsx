import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';

export default function CommunicationCreate({ event, recipientsCount }) {
    const [form, setForm] = useState({ subject: '', body: '' });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        router.post(`/events/${event.id}/communications`, form, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <EventLayout event={event}>
            <Head title={`Nueva comunicacion - ${event.name}`} />

            <form onSubmit={handleSubmit}>
                <Form
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button
                                variant="link"
                                onClick={() => router.visit(`/events/${event.id}/communications`)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                iconName="send"
                                formAction="submit"
                                loading={processing}
                                disabled={recipientsCount === 0}
                            >
                                Enviar comunicacion
                            </Button>
                        </SpaceBetween>
                    }
                >
                    <SpaceBetween size="l">
                        <Container
                            header={
                                <Header variant="h2" description="Escribe el mensaje que se enviara por correo a los participantes.">
                                    Nueva comunicacion
                                </Header>
                            }
                        >
                            <SpaceBetween size="l">
                                <Alert type="info">
                                    Este mensaje se enviara a <strong>{recipientsCount}</strong> participante{recipientsCount !== 1 ? 's' : ''} con estado registrado, confirmado o asistido.
                                </Alert>

                                {recipientsCount === 0 && (
                                    <Alert type="warning">
                                        No hay participantes activos en este evento. Registra participantes antes de enviar una comunicacion.
                                    </Alert>
                                )}

                                {errors.recipients && (
                                    <Alert type="error">{errors.recipients}</Alert>
                                )}

                                <FormField
                                    label="Asunto"
                                    errorText={errors.subject}
                                    constraintText="Maximo 255 caracteres"
                                >
                                    <Input
                                        value={form.subject}
                                        onChange={({ detail }) => setForm({ ...form, subject: detail.value })}
                                        placeholder="Ej: Informacion importante sobre el evento"
                                    />
                                </FormField>

                                <FormField
                                    label="Mensaje"
                                    errorText={errors.body}
                                    constraintText="Maximo 5000 caracteres"
                                >
                                    <Textarea
                                        value={form.body}
                                        onChange={({ detail }) => setForm({ ...form, body: detail.value })}
                                        placeholder="Escribe el contenido del mensaje..."
                                        rows={10}
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>
                    </SpaceBetween>
                </Form>
            </form>
        </EventLayout>
    );
}
