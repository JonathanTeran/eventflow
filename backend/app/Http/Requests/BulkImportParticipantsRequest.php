<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportParticipantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('participants.create');
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'El archivo es obligatorio.',
            'file.mimes' => 'El archivo debe ser un CSV.',
            'file.max' => 'El archivo no debe superar los 2MB.',
        ];
    }
}
