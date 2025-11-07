<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Assurez-vous d'avoir la table messages
        if (!Schema::hasTable('messages')) {
            // Créer la table messages si elle n'existe pas
            Schema::create('messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('membre_id')->nullable()->constrained('membres')->onDelete('cascade');
                $table->string('sender');
                $table->string('email');
                $table->text('content');
                $table->string('category')->default('Support');
                $table->boolean('read')->default(false);
                $table->timestamps();
            });
        }

        // Création de la table pour les réponses de l'administrateur
        Schema::create('admin_replies', function (Blueprint $table) {
            $table->id();
            // Clé étrangère vers le message initial
            $table->foreignId('message_id')->constrained()->onDelete('cascade'); 
            // admin_id est optionnel ici car nous n'avons pas d'Auth Admin complète pour l'instant
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null'); 
            
            $table->text('content'); // Contenu de la réponse
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_replies');
        Schema::dropIfExists('messages'); // Si vous avez mis la migration message ici
    }
};