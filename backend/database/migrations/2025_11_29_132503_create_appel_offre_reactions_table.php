<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appel_offre_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appel_offre_id')->constrained('appel_offres')->onDelete('cascade');
            $table->string('visitor_id');
            $table->string('type')->default('like');
            $table->timestamps();

            $table->unique(['appel_offre_id', 'visitor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appel_offre_reactions');
    }
};