<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Survey;
use App\Models\SurveyResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSurveyController extends Controller
{
    public function show(string $slug, Survey $survey, Request $request): Response
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if ($survey->event_id !== $event->id) {
            abort(404);
        }

        if ($survey->status !== 'active') {
            return Inertia::render('Public/SurveyClosed', [
                'event' => [
                    'name' => $event->name,
                    'slug' => $event->slug,
                ],
                'survey' => [
                    'title' => $survey->title,
                    'status' => $survey->status,
                ],
            ]);
        }

        $survey->load('questions');

        // Check if participant already responded (via registration_code query param)
        $registrationCode = $request->query('code');
        $participant = null;
        $hasResponded = false;

        if ($registrationCode) {
            $participant = Participant::where('event_id', $event->id)
                ->where('registration_code', $registrationCode)
                ->first();

            if ($participant) {
                $hasResponded = SurveyResponse::where('survey_id', $survey->id)
                    ->where('participant_id', $participant->id)
                    ->exists();
            }
        }

        return Inertia::render('Public/SurveyShow', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'questions' => $survey->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'type' => $q->type,
                    'options' => $q->options,
                    'required' => $q->required,
                ]),
            ],
            'participant' => $participant ? [
                'id' => $participant->id,
                'first_name' => $participant->first_name,
                'registration_code' => $participant->registration_code,
            ] : null,
            'hasResponded' => $hasResponded,
            'registrationCode' => $registrationCode,
        ]);
    }

    public function submit(Request $request, string $slug, Survey $survey)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if ($survey->event_id !== $event->id) {
            abort(404);
        }

        if ($survey->status !== 'active') {
            return back()->with('error', 'Esta encuesta ya no está activa.');
        }

        $validated = $request->validate([
            'registration_code' => ['nullable', 'string'],
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'string'],
            'answers.*.value' => ['nullable'],
        ]);

        // Find participant by registration code if provided
        $participant = null;
        if (! empty($validated['registration_code'])) {
            $participant = Participant::where('event_id', $event->id)
                ->where('registration_code', $validated['registration_code'])
                ->first();

            // Check if already responded
            if ($participant) {
                $alreadyResponded = SurveyResponse::where('survey_id', $survey->id)
                    ->where('participant_id', $participant->id)
                    ->exists();

                if ($alreadyResponded) {
                    return back()->with('error', 'Ya has respondido esta encuesta.');
                }
            }
        }

        // Validate required questions
        $survey->load('questions');
        $requiredQuestionIds = $survey->questions->where('required', true)->pluck('id');

        foreach ($requiredQuestionIds as $questionId) {
            $answer = collect($validated['answers'])->firstWhere('question_id', $questionId);
            if (! $answer || empty($answer['value'])) {
                return back()->with('error', 'Por favor responde todas las preguntas requeridas.');
            }
        }

        // Save responses
        foreach ($validated['answers'] as $answerData) {
            SurveyResponse::create([
                'survey_id' => $survey->id,
                'question_id' => $answerData['question_id'],
                'participant_id' => $participant?->id,
                'answer' => ['value' => $answerData['value'], 'values' => $answerData['values'] ?? null],
                'ip_address' => $request->ip(),
            ]);
        }

        return redirect()->route('public.survey.thanks', [
            'slug' => $event->slug,
            'survey' => $survey->id,
        ]);
    }

    public function thanks(string $slug, Survey $survey): Response
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/SurveyThanks', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'survey' => [
                'title' => $survey->title,
            ],
        ]);
    }
}
