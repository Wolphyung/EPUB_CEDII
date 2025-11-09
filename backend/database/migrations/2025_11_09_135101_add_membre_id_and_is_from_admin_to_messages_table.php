<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('membre_id')->constrained()->onDelete('cascade');
            $table->boolean('is_from_admin')->default(false);
        });

        Schema::table('admin_replies', function (Blueprint $table) {
            $table->boolean('is_from_admin')->default(true);
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['membre_id']);
            $table->dropColumn(['membre_id', 'is_from_admin']);
        });

        Schema::table('admin_replies', function (Blueprint $table) {
            $table->dropColumn('is_from_admin');
        });
    }
};