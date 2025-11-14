<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            // Vérifier si la colonne n'existe pas déjà
            if (!Schema::hasColumn('evenements', 'membre_id')) {
                $table->foreignId('membre_id')
                      ->nullable()
                      ->after('type')
                      ->constrained('membres')
                      ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropForeign(['membre_id']);
            $table->dropColumn('membre_id');
        });
    }
};