<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('communities.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la comunidad es obligatorio.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'url.url' => 'Ingresa una URL válida.',
            'description.max' => 'La descripción no puede exceder 1000 caracteres.',
        ];
    }
}
