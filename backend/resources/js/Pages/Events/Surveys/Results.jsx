import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Button from '@cloudscape-design/components/button';
import Badge from '@cloudscape-design/components/badge';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import BarChart from '@cloudscape-design/components/bar-chart';

const surveyStatusConfig = {
    draft: { label: 'Borrador', color: 'grey' },
    active: { label: 'Activa', color: 'green' },
    closed: { label: 'Cerrada', color: 'blue' },
};

function RatingResults({ question }) {
    const { summary, response_count } = question;
    const average = summary.average || 0;
    const distribution = summary.distribution || {};

    const chartData = [1, 2, 3, 4, 5].map((rating) => ({
        x: `${rating} estrellas`,
        y: distribution[rating] || 0,
    }));

    return (
        <SpaceBetween size="m">
            <Box variant="h4">
                Promedio: {average.toFixed(1)} / 5.0
            </Box>
            <BarChart
                series={[
                    {
                        title: 'Respuestas',
                        type: 'bar',
                        data: chartData,
                    },
                ]}
                xDomain={chartData.map((d) => d.x)}
                yDomain={[0, Math.max(...chartData.map((d) => d.y), 1)]}
                height={200}
                hideFilter
                hideLegend
            />
        </SpaceBetween>
    );
}

function ChoiceResults({ question }) {
    const { summary, options, response_count } = question;
    const distribution = summary.distribution || {};
    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

    const sortedOptions = (options || Object.keys(distribution)).map((option) => ({
        label: option,
        count: distribution[option] || 0,
        percentage: ((distribution[option] || 0) / total) * 100,
    })).sort((a, b) => b.count - a.count);

    return (
        <SpaceBetween size="s">
            {sortedOptions.map((option, idx) => (
                <div key={idx}>
                    <Box variant="p" margin={{ bottom: 'xxs' }}>
                        {option.label} ({option.count})
                    </Box>
                    <ProgressBar
                        value={option.percentage}
                        additionalInfo={`${option.percentage.toFixed(1)}%`}
                    />
                </div>
            ))}
        </SpaceBetween>
    );
}

function TextResults({ question }) {
    const { summary, response_count } = question;
    const responses = summary.responses || [];

    if (responses.length === 0) {
        return (
            <Box variant="p" color="text-status-inactive">
                No hay respuestas de texto todavía.
            </Box>
        );
    }

    return (
        <SpaceBetween size="xs">
            {responses.map((response, idx) => (
                <Box
                    key={idx}
                    padding="s"
                    variant="div"
                    backgroundColor="background-status-info"
                    borderRadius="m"
                >
                    "{response}"
                </Box>
            ))}
            {response_count > responses.length && (
                <Box variant="p" color="text-status-inactive">
                    ... y {response_count - responses.length} respuestas más
                </Box>
            )}
        </SpaceBetween>
    );
}

function QuestionResults({ question }) {
    const questionTypeLabels = {
        text: 'Texto libre',
        rating: 'Calificación',
        single_choice: 'Selección única',
        multiple_choice: 'Selección múltiple',
    };

    return (
        <Container
            header={
                <Header
                    variant="h3"
                    description={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Badge>{questionTypeLabels[question.type] || question.type}</Badge>
                            <span>{question.response_count} respuestas</span>
                        </SpaceBetween>
                    }
                >
                    {question.question_text}
                </Header>
            }
        >
            {question.response_count === 0 ? (
                <Box variant="p" color="text-status-inactive">
                    Aún no hay respuestas para esta pregunta.
                </Box>
            ) : (
                <>
                    {question.type === 'rating' && <RatingResults question={question} />}
                    {['single_choice', 'multiple_choice'].includes(question.type) && (
                        <ChoiceResults question={question} />
                    )}
                    {question.type === 'text' && <TextResults question={question} />}
                </>
            )}
        </Container>
    );
}

export default function SurveyResults({ event, survey, questionResults }) {
    const statusCfg = surveyStatusConfig[survey.status] || { label: survey.status, color: 'grey' };

    const actions = (
        <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={() => router.visit(`/events/${event.id}/surveys/${survey.id}/edit`)}>
                Editar encuesta
            </Button>
            <Button variant="link" onClick={() => router.visit(`/events/${event.id}/surveys`)}>
                Volver a encuestas
            </Button>
        </SpaceBetween>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Resultados: ${survey.title} - ${event.name}`} />

            <SpaceBetween size="l">
                <Container
                    header={
                        <Header
                            variant="h1"
                            description={survey.description}
                        >
                            {survey.title}
                        </Header>
                    }
                >
                    <ColumnLayout columns={3} variant="text-grid">
                        <div>
                            <Box variant="awsui-key-label">Estado</Box>
                            <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                        </div>
                        <div>
                            <Box variant="awsui-key-label">Total de respuestas</Box>
                            <Box variant="h2">{survey.response_count}</Box>
                        </div>
                        <div>
                            <Box variant="awsui-key-label">Preguntas</Box>
                            <Box variant="h2">{questionResults.length}</Box>
                        </div>
                    </ColumnLayout>
                </Container>

                {questionResults.length === 0 ? (
                    <Container>
                        <Box textAlign="center" padding="l">
                            <SpaceBetween size="m">
                                <Box variant="h3">No hay preguntas en esta encuesta</Box>
                                <Button onClick={() => router.visit(`/events/${event.id}/surveys/${survey.id}/edit`)}>
                                    Agregar preguntas
                                </Button>
                            </SpaceBetween>
                        </Box>
                    </Container>
                ) : (
                    <SpaceBetween size="m">
                        <Header variant="h2">Resultados por pregunta</Header>
                        {questionResults.map((question) => (
                            <QuestionResults key={question.id} question={question} />
                        ))}
                    </SpaceBetween>
                )}
            </SpaceBetween>
        </EventLayout>
    );
}
