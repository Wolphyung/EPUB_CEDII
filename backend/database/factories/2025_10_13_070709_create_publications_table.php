<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePublicationsTable extends Migration
{
    public function up()
    {
        Schema::create('publications', function (Blueprint $table) {
    $table->id('id_publication'); // auto-increment BIGINT UNSIGNED
    $table->string('titre', 500);
    $table->text('contenu')->nullable();
    $table->enum('type', ['Article', 'Annonce', 'Offre', 'Evenement']);
    $table->timestamp('date_publication')->useCurrent();
    $table->string('source')->nullable();
    $table->string('categorie')->nullable();
    $table->enum('statut', ['Brouillon', 'En attente', 'Validé', 'Rejeté'])->default('Brouillon');

    // ⚠️ FK
$table->unsignedBigInteger('id_utilisateur')->nullable(); // Assure-toi que le type correspond à $table->id()
$table->foreign('id_utilisateur')->references('id')->on('users')->onDelete('set null');


    $table->timestamps();
});

    }

    public function down()
    {
        Schema::dropIfExists('publications');
    }
}
