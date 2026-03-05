<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sponsor>
 */
class SponsorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'sponsor_level_id' => \App\Models\SponsorLevel::factory(),
            'company_name' => fake()->company(),
            'contact_name' => fake()->name(),
            'contact_email' => fake()->unique()->companyEmail(),
            'contact_phone' => fake()->phoneNumber(),
            'website' => fake()->url(),
            'description' => fake()->paragraph(),
            'amount_paid' => fake()->randomFloat(2, 100, 1000),
            'status' => 'confirmed',
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
