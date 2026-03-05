<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSponsorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('sponsors.create');
    }

    public function rules(): array
    {
        return [
            'sponsor_level_id' => ['nullable', 'string', Rule::exists('sponsor_levels', 'id')],
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['prospect', 'confirmed', 'paid'])],
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'El nombre de la empresa es obligatorio.',
            'contact_email.email' => 'Ingresa un correo electrónico válido.',
            'website.url' => 'Ingresa una URL válida.',
            'amount_paid.min' => 'El monto pagado no puede ser negativo.',
            'status.required' => 'El estado es obligatorio.',
        ];
    }
}
