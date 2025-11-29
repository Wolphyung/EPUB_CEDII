<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('publication_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')->constrained('publications', 'id_publication')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('visitor_id')->nullable(); // Pour identifier les visiteurs anonymes
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Empêcher les doublons
            $table->unique(['publication_id', 'user_id']);
            $table->unique(['publication_id', 'visitor_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('publication_reactions');
    }
};