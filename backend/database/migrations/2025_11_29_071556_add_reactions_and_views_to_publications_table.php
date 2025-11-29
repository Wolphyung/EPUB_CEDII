<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('publications', function (Blueprint $table) {
            if (!Schema::hasColumn('publications', 'total_reactions')) {
                $table->integer('total_reactions')->default(0);
            }
            if (!Schema::hasColumn('publications', 'vues')) {
                $table->integer('vues')->default(0);
            }
        });
    }

    public function down()
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropColumn(['total_reactions', 'vues']);
        });
    }
};