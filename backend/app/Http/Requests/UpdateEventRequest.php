<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('event'));
    }

    public function rules(): array
    {
        $event = $this->route('event');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('events')
                    ->where('organization_id', $event->organization_id)
                    ->ignore($event->id),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'date_start' => ['required', 'date'],
            'date_end' => ['required', 'date', 'after:date_start'],
            'location' => ['nullable', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'registration_type' => ['required', Rule::in(['open', 'invite'])],
            'settings' => ['nullable', 'array'],
            'settings.scan_types' => ['nullable', 'array'],
            'settings.scan_types.*.key' => ['required_with:settings.scan_types', 'string', 'max:50'],
            'settings.scan_types.*.label' => ['required_with:settings.scan_types', 'string', 'max:100'],
            'settings.scan_types.*.enabled' => ['required_with:settings.scan_types', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del evento es obligatorio.',
            'slug.required' => 'El slug es obligatorio.',
            'slug.unique' => 'Ya existe un evento con este slug en tu organización.',
            'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones.',
            'date_start.required' => 'La fecha de inicio es obligatoria.',
            'date_end.required' => 'La fecha de fin es obligatoria.',
            'date_end.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'capacity.min' => 'La capacidad debe ser al menos 1.',
        ];
    }
}
