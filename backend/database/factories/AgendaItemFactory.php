<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgendaItem>
 */
class AgendaItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'date' => fake()->date(),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'location_detail' => fake()->word(),
            'type' => 'talk',
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
