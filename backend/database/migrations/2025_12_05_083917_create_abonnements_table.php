<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_abonnements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abonnements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membre_id')->constrained('membres')->onDelete('cascade');
            $table->string('type_abonnement'); // mensuel, trimestriel, annuel
            $table->date('date_debut');
            $table->date('date_fin');
            $table->enum('statut', ['actif', 'expiré', 'annulé'])->default('actif');
            $table->decimal('montant', 10, 2);
            $table->string('methode_paiement')->nullable();
            $table->string('transaction_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('statut');
            $table->index('date_fin');
            $table->index('membre_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnements');
    }
};