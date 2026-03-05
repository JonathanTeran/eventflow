import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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
import Box from '@cloudscape-design/components/box';
import Toggle from '@cloudscape-design/components/toggle';
import TokenGroup from '@cloudscape-design/components/token-group';
import ColumnLayout from '@cloudscape-design/components/column-layout';

const surveyTypeOptions = [
    { value: 'pre_event', label: 'Pre-evento', description: 'Enviar antes del evento' },
    { value: 'post_event', label: 'Post-evento', description: 'Enviar después del evento' },
];

const questionTypeOptions = [
    { value: 'text', label: 'Texto libre' },
    { value: 'rating', label: 'Calificación (1-5)' },
    { value: 'single_choice', label: 'Selección única' },
    { value: 'multiple_choice', label: 'Selección múltiple' },
];

export default function SurveyCreate({ event }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: surveyTypeOptions[1],
        questions: [
            { question_text: '', type: questionTypeOptions[0], options: [], required: true, newOption: '' },
        ],
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function addQuestion() {
        setForm({
            ...form,
            questions: [
                ...form.questions,
                { question_text: '', type: questionTypeOptions[0], options: [], required: false, newOption: '' },
            ],
        });
    }

    function removeQuestion(index) {
        if (form.questions.length === 1) return;
        const newQuestions = [...form.questions];
        newQuestions.splice(index, 1);
        setForm({ ...form, questions: newQuestions });
    }

    function updateQuestion(index, field, value) {
        const newQuestions = [...form.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        // Reset options when changing to a type that doesn't use them
        if (field === 'type' && !['single_choice', 'multiple_choice'].includes(value.value)) {
            newQuestions[index].options = [];
        }
        setForm({ ...form, questions: newQuestions });
    }

    function addOption(qIndex) {
        const question = form.questions[qIndex];
        if (!question.newOption.trim()) return;
        const newQuestions = [...form.questions];
        newQuestions[qIndex] = {
            ...question,
            options: [...question.options, question.newOption.trim()],
            newOption: '',
        };
        setForm({ ...form, questions: newQuestions });
    }

    function removeOption(qIndex, optionIndex) {
        const newQuestions = [...form.questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== optionIndex);
        setForm({ ...form, questions: newQuestions });
    }

    function submit(e) {
        e.preventDefault();
        setProcessing(true);

        const data = {
            title: form.title,
            description: form.description,
            type: form.type.value,
            questions: form.questions.map((q) => ({
                question_text: q.question_text,
                type: q.type.value,
                options: q.options.length > 0 ? q.options : null,
                required: q.required,
            })),
        };

        router.post(`/events/${event.id}/surveys`, data, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <EventLayout event={event}>
            <Head title={`Nueva encuesta - ${event.name}`} />

            <form onSubmit={submit}>
                <Form
                    header={<Header variant="h1">Nueva encuesta</Header>}
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => router.visit(`/events/${event.id}/surveys`)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" loading={processing}>
                                Crear encuesta
                            </Button>
                        </SpaceBetween>
                    }
                >
                    <SpaceBetween size="l">
                        <Container header={<Header variant="h2">Información general</Header>}>
                            <SpaceBetween size="m">
                                <FormField label="Título" errorText={errors.title}>
                                    <Input
                                        value={form.title}
                                        onChange={({ detail }) => setForm({ ...form, title: detail.value })}
                                        placeholder="Ej: Encuesta de satisfacción"
                                    />
                                </FormField>

                                <FormField label="Descripción (opcional)" errorText={errors.description}>
                                    <Textarea
                                        value={form.description}
                                        onChange={({ detail }) => setForm({ ...form, description: detail.value })}
                                        placeholder="Instrucciones o contexto para los participantes"
                                    />
                                </FormField>

                                <FormField label="Tipo de encuesta" errorText={errors.type}>
                                    <Select
                                        selectedOption={form.type}
                                        onChange={({ detail }) => setForm({ ...form, type: detail.selectedOption })}
                                        options={surveyTypeOptions}
                                    />
                                </FormField>
                            </SpaceBetween>
                        </Container>

                        <Container
                            header={
                                <Header
                                    variant="h2"
                                    actions={
                                        <Button iconName="add-plus" onClick={addQuestion}>
                                            Agregar pregunta
                                        </Button>
                                    }
                                >
                                    Preguntas ({form.questions.length})
                                </Header>
                            }
                        >
                            <SpaceBetween size="l">
                                {form.questions.map((question, qIndex) => (
                                    <Container
                                        key={qIndex}
                                        header={
                                            <Header
                                                variant="h3"
                                                actions={
                                                    form.questions.length > 1 && (
                                                        <Button
                                                            variant="icon"
                                                            iconName="remove"
                                                            onClick={() => removeQuestion(qIndex)}
                                                        />
                                                    )
                                                }
                                            >
                                                Pregunta {qIndex + 1}
                                            </Header>
                                        }
                                    >
                                        <SpaceBetween size="m">
                                            <ColumnLayout columns={2}>
                                                <FormField
                                                    label="Pregunta"
                                                    errorText={errors[`questions.${qIndex}.question_text`]}
                                                >
                                                    <Input
                                                        value={question.question_text}
                                                        onChange={({ detail }) =>
                                                            updateQuestion(qIndex, 'question_text', detail.value)
                                                        }
                                                        placeholder="Escribe tu pregunta aquí"
                                                    />
                                                </FormField>

                                                <FormField
                                                    label="Tipo de respuesta"
                                                    errorText={errors[`questions.${qIndex}.type`]}
                                                >
                                                    <Select
                                                        selectedOption={question.type}
                                                        onChange={({ detail }) =>
                                                            updateQuestion(qIndex, 'type', detail.selectedOption)
                                                        }
                                                        options={questionTypeOptions}
                                                    />
                                                </FormField>
                                            </ColumnLayout>

                                            {['single_choice', 'multiple_choice'].includes(question.type.value) && (
                                                <FormField label="Opciones de respuesta">
                                                    <SpaceBetween size="xs">
                                                        <TokenGroup
                                                            items={question.options.map((opt, i) => ({
                                                                label: opt,
                                                                dismissLabel: `Eliminar ${opt}`,
                                                            }))}
                                                            onDismiss={({ detail }) =>
                                                                removeOption(qIndex, detail.itemIndex)
                                                            }
                                                        />
                                                        <SpaceBetween direction="horizontal" size="xs">
                                                            <Input
                                                                value={question.newOption}
                                                                onChange={({ detail }) =>
                                                                    updateQuestion(qIndex, 'newOption', detail.value)
                                                                }
                                                                placeholder="Nueva opción"
                                                                onKeyDown={({ detail }) => {
                                                                    if (detail.key === 'Enter') {
                                                                        detail.preventDefault?.();
                                                                        addOption(qIndex);
                                                                    }
                                                                }}
                                                            />
                                                            <Button onClick={() => addOption(qIndex)}>Agregar</Button>
                                                        </SpaceBetween>
                                                    </SpaceBetween>
                                                </FormField>
                                            )}

                                            <Toggle
                                                checked={question.required}
                                                onChange={({ detail }) =>
                                                    updateQuestion(qIndex, 'required', detail.checked)
                                                }
                                            >
                                                Pregunta requerida
                                            </Toggle>
                                        </SpaceBetween>
                                    </Container>
                                ))}
                            </SpaceBetween>
                        </Container>
                    </SpaceBetween>
                </Form>
            </form>
        </EventLayout>
    );
}
