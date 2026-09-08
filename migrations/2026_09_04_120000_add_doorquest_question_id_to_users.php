<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('users', 'doorquest_question_id')) {
            $schema->table('users', function (Blueprint $table) {
                $table->unsignedInteger('doorquest_question_id')->nullable();
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasColumn('users', 'doorquest_question_id')) {
            $schema->table('users', function (Blueprint $table) {
                $table->dropColumn('doorquest_question_id');
            });
        }
    },
];
