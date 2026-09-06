<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('doorquest_questions')) {
            $schema->create('doorquest_questions', function (Blueprint $table) {
                $table->increments('id');
                $table->text('question');
                $table->string('answer');
                $table->unsignedInteger('group_id')->nullable();
                $table->unsignedInteger('max_uses')->default(0);
                $table->unsignedInteger('uses')->default(0);
                $table->boolean('activates')->default(false);
                $table->unsignedInteger('created_by')->nullable();
                $table->timestamps();

                $table->foreign('group_id')->references('id')->on('groups')->nullOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            });
        }

        if (!$schema->hasColumn('users', 'doorquest_answer')) {
            $schema->table('users', function (Blueprint $table) {
                $table->string('doorquest_answer', 128)->nullable();
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('doorquest_questions');

        $schema->table('users', function (Blueprint $table) {
            $table->dropColumn('doorquest_answer');
        });
    },
];
