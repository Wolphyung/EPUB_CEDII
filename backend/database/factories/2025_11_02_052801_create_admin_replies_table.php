<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admin_replies', function (Blueprint $table) {
            $table->id();
            // Clé étrangère vers le message initial
            $table->foreignId('message_id')->constrained()->onDelete('cascade'); 
            // L'administrateur qui a envoyé le message (si vous avez un système d'auth)
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null'); 
            
            $table->text('content'); // Contenu de la réponse
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_replies');
    }
};