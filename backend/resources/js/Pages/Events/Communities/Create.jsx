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

export default function CommunityCreate({ event }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        url: '',
        description: '',
    });

    function submit(e) {
        e.preventDefault();
        post(`/events/${event.id}/communities`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Agregar comunidad - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description="Completa la información de la comunidad asociada a este evento."
                        >
                            Agregar comunidad
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
                                Guardar comunidad
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
                                    placeholder="Ej: Python Ecuador"
                                />
                            </FormField>

                            <FormField label="URL / Sitio web" errorText={errors.url}>
                                <Input
                                    value={data.url}
                                    onChange={({ detail }) => setData('url', detail.value)}
                                    placeholder="https://www.ejemplo.com"
                                    type="url"
                                />
                            </FormField>

                            <FormField label="Descripción" errorText={errors.description}>
                                <Textarea
                                    value={data.description}
                                    onChange={({ detail }) => setData('description', detail.value)}
                                    placeholder="Descripción de la comunidad..."
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
