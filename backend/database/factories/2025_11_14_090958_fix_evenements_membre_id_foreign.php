<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            // Vérifier si la colonne existe déjà
            if (!Schema::hasColumn('evenements', 'membre_id')) {
                $table->foreignId('membre_id')->nullable()->after('type');
            }
            
            // Supprimer l'ancienne clé étrangère si elle existe
            $table->dropForeign(['membre_id']);
            
            // Recréer la clé étrangère vers la table membre
            $table->foreign('membre_id')
                  ->references('id')
                  ->on('membre')
                  ->onDelete('cascade');
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