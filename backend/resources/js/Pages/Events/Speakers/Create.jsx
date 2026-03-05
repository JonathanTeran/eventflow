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

const speakerStatusOptions = [
    { value: 'invited', label: 'Invitado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'declined', label: 'Declinado' },
];

export default function SpeakerCreate({ event }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        status: 'invited',
        bio: '',
        social_links: {
            twitter: '',
            linkedin: '',
            website: '',
        },
    });

    function submit(e) {
        e.preventDefault();
        post(`/events/${event.id}/speakers`);
    }

    return (
        <EventLayout event={event}>
            <Head title={`Agregar speaker - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={
                        <Header
                            variant="h1"
                            description="Registra un nuevo speaker para este evento."
                        >
                            Agregar speaker
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
                                Agregar speaker
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
                                            placeholder="Ej: Ana"
                                        />
                                    </FormField>
                                    <FormField label="Apellido" errorText={errors.last_name}>
                                        <Input
                                            value={data.last_name}
                                            onChange={({ detail }) => setData('last_name', detail.value)}
                                            placeholder="Ej: García"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField label="Correo electrónico" errorText={errors.email}>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={({ detail }) => setData('email', detail.value)}
                                            placeholder="Ej: ana@empresa.com"
                                        />
                                    </FormField>
                                    <FormField label="Teléfono" errorText={errors.phone}>
                                        <Input
                                            value={data.phone}
                                            onChange={({ detail }) => setData('phone', detail.value)}
                                            placeholder="Ej: +593 99 123 4567"
                                        />
                                    </FormField>
                                </ColumnLayout>

                                <ColumnLayout columns={2}>
                                    <FormField label="Empresa" errorText={errors.company}>
                                        <Input
                                            value={data.company}
                                            onChange={({ detail }) => setData('company', detail.value)}
                                            placeholder="Ej: Tech Corp"
                                        />
                                    </FormField>
                                    <FormField label="Cargo" errorText={errors.job_title}>
                                        <Input
                                            value={data.job_title}
                                            onChange={({ detail }) => setData('job_title', detail.value)}
                                            placeholder="Ej: CTO"
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
                                        placeholder="Breve biografía del speaker..."
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
        </EventLayout>
    );
}
