<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Speaker>
 */
class SpeakerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'company' => fake()->company(),
            'job_title' => fake()->jobTitle(),
            'bio' => fake()->paragraph(),
            'status' => 'confirmed',
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
