<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->onDelete('cascade');
            $table->string('visitor_id'); // Identifiant unique du visiteur (cookie, IP, etc.)
            $table->string('type')->default('like'); // like, love, etc.
            $table->timestamps();

            $table->unique(['evenement_id', 'visitor_id']); // Un visiteur ne peut réagir qu'une fois
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_reactions');
    }
};