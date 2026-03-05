<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $name = fake()->sentence(3);
        $dateStart = fake()->dateTimeBetween('+1 week', '+3 months');
        $dateEnd = (clone $dateStart)->modify('+' . fake()->numberBetween(1, 3) . ' days');

        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(4),
            'description' => fake()->paragraphs(2, true),
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'location' => fake()->city(),
            'venue' => fake()->company() . ' Convention Center',
            'capacity' => fake()->randomElement([100, 200, 500, 1000]),
            'registration_type' => 'open',
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => 'published']);
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => 'active']);
    }
}
