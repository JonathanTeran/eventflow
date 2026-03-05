<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicRegisterParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'country' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'El nombre es obligatorio.',
            'first_name.max' => 'El nombre no puede exceder 255 caracteres.',
            'last_name.required' => 'El apellido es obligatorio.',
            'last_name.max' => 'El apellido no puede exceder 255 caracteres.',
            'email.required' => 'El correo electronico es obligatorio.',
            'email.email' => 'Ingresa un correo electronico valido.',
            'email.max' => 'El correo no puede exceder 255 caracteres.',
            'phone.max' => 'El telefono no puede exceder 50 caracteres.',
            'company.max' => 'La empresa no puede exceder 255 caracteres.',
            'job_title.max' => 'El cargo no puede exceder 255 caracteres.',
            'country.required' => 'El pais es obligatorio.',
            'city.required' => 'La ciudad es obligatoria.',
        ];
    }
}
