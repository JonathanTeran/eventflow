<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgendaItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('agenda.create');
    }

    public function rules(): array
    {
        return [
            'speaker_id' => ['nullable', 'string', Rule::exists('speakers', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'location_detail' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::in(['talk', 'workshop', 'break', 'networking', 'ceremony'])],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'date.required' => 'La fecha es obligatoria.',
            'start_time.required' => 'La hora de inicio es obligatoria.',
            'start_time.date_format' => 'El formato de hora de inicio debe ser HH:MM.',
            'end_time.required' => 'La hora de fin es obligatoria.',
            'end_time.date_format' => 'El formato de hora de fin debe ser HH:MM.',
            'end_time.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
            'type.required' => 'El tipo de sesión es obligatorio.',
        ];
    }
}
