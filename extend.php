<?php

namespace Stezkoy\FlarumDoorquest;

use Flarum\Api\Resource\UserResource;
use Flarum\Api\Schema;
use Flarum\Extend;
use Flarum\Search\Database\DatabaseSearchDriver;
use Flarum\User\Event\Registered;
use Flarum\User\Event\Saving as UserSaving;
use Flarum\User\User;
use Stezkoy\FlarumDoorquest\Api\Controller\RandomQuestionController;
use Stezkoy\FlarumDoorquest\Content\AdminPayload;
use Stezkoy\FlarumDoorquest\Listeners\AddValidatorRule;
use Stezkoy\FlarumDoorquest\Listeners\PostRegisterOperations;
use Stezkoy\FlarumDoorquest\Listeners\ValidateAnswer;
use Stezkoy\FlarumDoorquest\Search\FulltextFilter;
use Stezkoy\FlarumDoorquest\Search\QuestionSearcher;
use Stezkoy\FlarumDoorquest\Validators\AnswerValidator;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->jsDirectory(__DIR__.'/js/dist/admin')
        ->css(__DIR__.'/resources/less/admin.less')
        ->content(AdminPayload::class),

    (new Extend\Model(User::class))
        ->cast('doorquest_answer', 'string')
        ->cast('doorquest_question_id', 'integer'),

    new Extend\Locales(__DIR__.'/resources/locale'),

    (new Extend\Validator(AnswerValidator::class))
        ->configure(AddValidatorRule::class),

    (new Extend\Event())
        ->listen(Registered::class, PostRegisterOperations::class)
        ->listen(UserSaving::class, ValidateAnswer::class),

    new Extend\ApiResource(Api\Resource\QuestionResource::class),

    (new Extend\SearchDriver(DatabaseSearchDriver::class))
        ->addSearcher(Question::class, QuestionSearcher::class)
        ->setFulltext(QuestionSearcher::class, FulltextFilter::class),


    (new Extend\Routes('api'))
        ->get('/doorquest/random', 'doorquest.random', RandomQuestionController::class),

    (new Extend\ApiResource(UserResource::class))
        ->fields(fn () => [
            Schema\Str::make('fof-doorquest-id')
                ->writableOnCreate()
                ->nullable()
                ->visible(false)
                ->set(fn () => null),
            Schema\Str::make('fof-doorquest-answer')
                ->writableOnCreate()
                ->nullable()
                ->visible(false)
                ->set(fn () => null),
        ]),
];
