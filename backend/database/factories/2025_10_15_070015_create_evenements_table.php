<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->dateTime('date_heure');
            $table->string('lieu');
            $table->enum('type', ['Présentiel', 'En ligne', 'Hybride'])->default('Présentiel');

            // ✅ AJOUT DE LA COLONNE STATUT :
            $table->enum('statut', ['En attente', 'Validé', 'Rejeté'])->default('En attente');

            $table->string('fichier')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};
