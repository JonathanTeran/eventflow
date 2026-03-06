<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

        $surveys = $event->surveys()
            ->withCount('questions')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($survey) => [
                'id' => $survey->id,
                'title' => $survey->title,
                'type' => $survey->type,
                'status' => $survey->status,
                'questions_count' => $survey->questions_count,
                'response_count' => $survey->responseCount(),
                'created_at' => $survey->created_at,
            ]);

        return Inertia::render('Events/Surveys/Index', [
            'event' => $event,
            'surveys' => $surveys,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Surveys/Create', [
            'event' => $event,
        ]);
    }

    public function store(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:pre_event,post_event'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.type' => ['required', 'in:text,rating,multiple_choice,single_choice'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.required' => ['boolean'],
        ]);

        $survey = $event->surveys()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => 'draft',
            'organization_id' => $event->organization_id,
        ]);

        foreach ($validated['questions'] as $index => $questionData) {
            $survey->questions()->create([
                'question_text' => $questionData['question_text'],
                'type' => $questionData['type'],
                'options' => $questionData['options'] ?? null,
                'required' => $questionData['required'] ?? false,
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('events.surveys.index', $event)
            ->with('success', 'Encuesta creada correctamente.');
    }

    public function edit(Event $event, Survey $survey): Response
    {
        $this->authorize('update', $event);

        $survey->load('questions');

        return Inertia::render('Events/Surveys/Edit', [
            'event' => $event,
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'type' => $survey->type,
                'status' => $survey->status,
                'questions' => $survey->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'type' => $q->type,
                    'options' => $q->options,
                    'required' => $q->required,
                ]),
            ],
        ]);
    }

    public function update(Request $request, Event $event, Survey $survey)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:pre_event,post_event'],
            'status' => ['required', 'in:draft,active,closed'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.id' => ['nullable', 'string'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.type' => ['required', 'in:text,rating,multiple_choice,single_choice'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.required' => ['boolean'],
        ]);

        $survey->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
        ]);

        // Delete removed questions
        $existingIds = collect($validated['questions'])->pluck('id')->filter();
        $survey->questions()->whereNotIn('id', $existingIds)->delete();

        // Update or create questions
        foreach ($validated['questions'] as $index => $questionData) {
            if (! empty($questionData['id'])) {
                SurveyQuestion::where('id', $questionData['id'])->update([
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'required' => $questionData['required'] ?? false,
                    'sort_order' => $index,
                ]);
            } else {
                $survey->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'required' => $questionData['required'] ?? false,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->route('events.surveys.index', $event)
            ->with('success', 'Encuesta actualizada correctamente.');
    }

    public function destroy(Event $event, Survey $survey)
    {
        $this->authorize('update', $event);

        $survey->delete();

        return back()->with('success', 'Encuesta eliminada correctamente.');
    }

    public function results(Event $event, Survey $survey): Response
    {
        $this->authorize('view', $event);

        $survey->load(['questions.responses']);

        $questionResults = $survey->questions->map(function ($question) {
            $responses = $question->responses;

            $summary = match ($question->type) {
                'rating' => [
                    'average' => $responses->avg(fn ($r) => $r->answer['value'] ?? 0),
                    'distribution' => $responses->groupBy(fn ($r) => $r->answer['value'] ?? 0)->map->count(),
                ],
                'single_choice', 'multiple_choice' => [
                    'distribution' => $responses->flatMap(fn ($r) => (array) ($r->answer['values'] ?? [$r->answer['value'] ?? null]))
                        ->filter()
                        ->countBy()
                        ->toArray(),
                ],
                default => [
                    'responses' => $responses->take(20)->pluck('answer.value'),
                ],
            };

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'options' => $question->options,
                'response_count' => $responses->count(),
                'summary' => $summary,
            ];
        });

        return Inertia::render('Events/Surveys/Results', [
            'event' => $event,
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'type' => $survey->type,
                'status' => $survey->status,
                'response_count' => $survey->responseCount(),
            ],
            'questionResults' => $questionResults,
        ]);
    }
}
