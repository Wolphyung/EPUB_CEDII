<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'message', 'publication', 'event', 'appel_offre', 'abonnement'
            $table->text('message');
            $table->string('organisation_name')->nullable();
            $table->unsignedBigInteger('item_id')->nullable();
            $table->string('item_type')->nullable();
            $table->boolean('read')->default(false);
            $table->unsignedBigInteger('user_id');
            $table->string('icon')->default('fas fa-bell');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'read']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};