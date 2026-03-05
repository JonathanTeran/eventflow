<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSpeakerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('speakers.create');
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:5000'],
            'social_links' => ['nullable', 'array'],
            'social_links.twitter' => ['nullable', 'url', 'max:255'],
            'social_links.linkedin' => ['nullable', 'url', 'max:255'],
            'social_links.website' => ['nullable', 'url', 'max:255'],
            'status' => ['required', Rule::in(['invited', 'confirmed', 'declined'])],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'El nombre es obligatorio.',
            'last_name.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'status.required' => 'El estado es obligatorio.',
            'social_links.twitter.url' => 'Ingresa una URL válida para Twitter.',
            'social_links.linkedin.url' => 'Ingresa una URL válida para LinkedIn.',
            'social_links.website.url' => 'Ingresa una URL válida para el sitio web.',
        ];
    }
}
