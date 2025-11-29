<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('publication_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('publication_id');
            $table->string('visitor_id'); // ID unique du visiteur
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Clé étrangère
            $table->foreign('publication_id')
                  ->references('id_publication')
                  ->on('publications')
                  ->onDelete('cascade');

            // Empêcher les vues multiples du même visiteur sur la même publication
            $table->unique(['publication_id', 'visitor_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('publication_views');
    }
};