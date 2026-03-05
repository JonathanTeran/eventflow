<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->string('networking_pin', 6)->nullable()->after('registration_code');
            $table->unique(['event_id', 'networking_pin'], 'participants_event_networking_pin_unique');
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropUnique('participants_event_networking_pin_unique');
            $table->dropColumn('networking_pin');
        });
    }
};
