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

    protected function prepareForValidation(): void
    {
        $this->merge([
            'start_time' => self::normalizeTime($this->start_time),
            'end_time' => self::normalizeTime($this->end_time),
        ]);
    }

    /**
     * Normalize locale-formatted time (e.g. "09:45 a.m.", "2:30 p. m.") to H:i (24h).
     */
    public static function normalizeTime(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        // Strip seconds if present (HH:MM:SS → HH:MM)
        if (preg_match('/^(\d{1,2}:\d{2}):\d{2}$/', $value, $m)) {
            $value = $m[1];
        }

        // Handle 12-hour format with AM/PM (e.g. "9:45 a.m.", "2:30 p. m.")
        $normalized = preg_replace('/\s+/', ' ', $value); // collapse spaces
        if (preg_match('/^(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)$/i', $normalized, $m)) {
            $hour = (int) $m[1];
            $minute = $m[2];
            $period = strtolower(preg_replace('/[\s.]/', '', $m[3])); // "am" or "pm"

            if ($period === 'pm' && $hour < 12) {
                $hour += 12;
            } elseif ($period === 'am' && $hour === 12) {
                $hour = 0;
            }

            return sprintf('%02d:%s', $hour, $minute);
        }

        // Already in H:i or HH:MM format
        if (preg_match('/^\d{1,2}:\d{2}$/', $value)) {
            $parts = explode(':', $value);
            return sprintf('%02d:%s', (int) $parts[0], $parts[1]);
        }

        return $value;
    }

    public function rules(): array
    {
        return [
            'speaker_id' => ['nullable', 'string', Rule::exists('speakers', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'date' => [
                'required',
                'date',
                'after_or_equal:' . substr($this->route('event')->getRawOriginal('date_start'), 0, 10),
                'before_or_equal:' . substr($this->route('event')->getRawOriginal('date_end'), 0, 10),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'location_detail' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::in(['talk', 'workshop', 'break', 'networking', 'ceremony'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            self::validateTimeWithinEvent($validator, $this->route('event'), $this->input('date'), $this->input('start_time'), $this->input('end_time'));
        });
    }

    public static function validateTimeWithinEvent($validator, $event, ?string $date, ?string $startTime, ?string $endTime): void
    {
        if (! $date || ! $startTime || ! $endTime) {
            return;
        }

        $rawStart = $event->getRawOriginal('date_start');
        $rawEnd = $event->getRawOriginal('date_end');

        $eventStartDate = substr($rawStart, 0, 10);
        $eventEndDate = substr($rawEnd, 0, 10);
        $eventStartTime = substr($rawStart, 11, 5);
        $eventEndTime = substr($rawEnd, 11, 5);

        if ($date === $eventStartDate && $eventStartTime !== '00:00' && $startTime < $eventStartTime) {
            $validator->errors()->add('start_time', "La hora de inicio no puede ser antes de las {$eventStartTime} (inicio del evento).");
        }

        if ($date === $eventEndDate && $eventEndTime !== '00:00' && $endTime > $eventEndTime) {
            $validator->errors()->add('end_time', "La hora de fin no puede ser después de las {$eventEndTime} (fin del evento).");
        }
    }

    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'La fecha debe estar dentro del rango del evento.',
            'date.before_or_equal' => 'La fecha debe estar dentro del rango del evento.',
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
