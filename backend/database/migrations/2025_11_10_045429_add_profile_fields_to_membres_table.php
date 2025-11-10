<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->string('prenom')->after('nom');
            $table->string('telephone')->nullable()->after('statut');
            $table->text('adresse')->nullable()->after('telephone');
            $table->string('ville')->nullable()->after('adresse');
            $table->string('pays')->nullable()->after('ville');
            $table->text('bio')->nullable()->after('pays');
            $table->date('date_naissance')->nullable()->after('bio');
            $table->string('profession')->nullable()->after('date_naissance');
            $table->string('site_web')->nullable()->after('profession');
            $table->string('linkedin')->nullable()->after('site_web');
            $table->string('twitter')->nullable()->after('linkedin');
        });
    }

    public function down(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->dropColumn([
                'prenom',
                'telephone',
                'adresse',
                'ville',
                'pays',
                'bio',
                'date_naissance',
                'profession',
                'site_web',
                'linkedin',
                'twitter'
            ]);
        });
    }
};