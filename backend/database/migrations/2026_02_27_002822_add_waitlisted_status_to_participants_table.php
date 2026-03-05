<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_status_check");
            DB::statement("ALTER TABLE participants ADD CONSTRAINT participants_status_check CHECK (status::text = ANY (ARRAY['registered'::text, 'confirmed'::text, 'attended'::text, 'cancelled'::text, 'waitlisted'::text]))");
        }
        // SQLite: no constraint to modify — enum is stored as plain string
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_status_check");
            DB::statement("ALTER TABLE participants ADD CONSTRAINT participants_status_check CHECK (status::text = ANY (ARRAY['registered'::text, 'confirmed'::text, 'attended'::text, 'cancelled'::text]))");
        }
    }
};
