<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            // Ajoute la colonne membre_id comme clé étrangère vers la table membres
            $table->foreignId('membre_id')
                ->nullable()                 // Peut être null si aucun membre
                ->after('id_utilisateur')    // Place la colonne après id_utilisateur
                ->constrained('membres')    // Référence la colonne id de membres
                ->onDelete('set null');      // Si le membre est supprimé, membre_id devient NULL
        });
    }

    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropForeign(['membre_id']); // Supprime la contrainte étrangère
            $table->dropColumn('membre_id');    // Supprime la colonne
        });
    }
};
