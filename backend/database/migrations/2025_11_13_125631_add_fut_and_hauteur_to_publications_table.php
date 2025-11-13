<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('publications', function (Blueprint $table) {
        $table->bigInteger('hauteur')->nullable()->after('nom_fichier_original');
        $table->string('fut')->nullable()->after('hauteur');
    });
}

public function down()
{
    Schema::table('publications', function (Blueprint $table) {
        $table->dropColumn(['hauteur', 'fut']);
    });
}


    
};
