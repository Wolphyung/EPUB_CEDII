<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Ce nom de classe varie selon la date et l'heure de création
return new class extends Migration
{
    /**
     * Exécute les migrations (ajoute les colonnes).
     */
    public function up(): void
    {
        // 🎯 On utilise Schema::table pour MODIFIER la table existante
        Schema::table('appel_offres', function (Blueprint $table) {

            // Ajout des nouveaux champs (String)
            $table->string('type', 100)->nullable();
            $table->string('localisation')->nullable();
            $table->string('salaire')->nullable();

            // Ajout du champ Booléen avec une valeur par défaut
            // Cela permet de garantir qu'une valeur existe même pour les lignes anciennes
            $table->boolean('urgent')->default(false);
        });
    }

    /**
     * Annule les migrations (supprime les colonnes).
     */
    public function down(): void
    {
        // On utilise Schema::table pour la suppression des colonnes
        Schema::table('appel_offres', function (Blueprint $table) {
            // Il faut lister toutes les colonnes à supprimer pour la marche arrière
            $table->dropColumn(['type', 'localisation', 'salaire', 'urgent']);
        });
    }
};
