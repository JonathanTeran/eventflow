<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SponsorLevel>
 */
class SponsorLevelFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'name' => fake()->word(),
            'sort_order' => fake()->numberBetween(1, 10),
            'benefits' => ['Logo on website', 'Booth space'],
            'price' => fake()->randomFloat(2, 100, 1000),
        ];
    }
}
