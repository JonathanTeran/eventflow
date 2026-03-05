<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->jsonb('social_links')->nullable()->after('networking_pin');
            $table->boolean('networking_visible')->default(false)->after('social_links');
            $table->index('networking_visible');
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropIndex(['networking_visible']);
            $table->dropColumn(['social_links', 'networking_visible']);
        });
    }
};
