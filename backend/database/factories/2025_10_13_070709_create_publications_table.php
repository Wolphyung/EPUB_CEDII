<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePublicationsTable extends Migration
{
    public function up()
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id('id_publication');
            $table->string('titre', 500);
            $table->text('contenu')->nullable();
            $table->enum('type', ['Article', 'Annonce', 'Offre', 'Evenement']);
            $table->timestamp('date_publication')->useCurrent();
            $table->string('source')->nullable();
            $table->string('categorie')->nullable();
            $table->enum('statut', ['Brouillon', 'En attente', 'Validé', 'Rejeté'])->default('En attente');

            // Nouveaux champs pour les fichiers
            $table->string('fichier')->nullable(); // Chemin du fichier
            $table->enum('type_fichier', ['image', 'video', 'document'])->nullable(); // Type de fichier
            $table->string('nom_fichier_original')->nullable(); // Nom original du fichier

            // Champs existants
            $table->string('auteur')->nullable();
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->foreign('id_utilisateur')->references('id')->on('membres')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('publications');
    }
}
