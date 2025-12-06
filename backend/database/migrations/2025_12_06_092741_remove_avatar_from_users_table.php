<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer uniquement la colonne avatar, conserver statut
            $table->dropColumn('avatar');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Pour rollback, recréer la colonne avatar
            $table->string('avatar')->nullable()->after('email_verified_at');
        });
    }
};