<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appel_offres', function (Blueprint $table) {
            $table->id();
            $table->string('intitule');
            $table->text('description');
            $table->date('date_ouverture')->nullable();
            $table->date('date_cloture')->nullable();
            $table->string('membre')->nullable();
            $table->string('fichier')->nullable(); // chemin du fichier uploadé
            $table->string('statut')->default('En attente'); // En attente, Validé, Rejeté, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appel_offres');
    }
};
