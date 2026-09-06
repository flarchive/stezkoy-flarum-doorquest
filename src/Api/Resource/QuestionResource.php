<?php

namespace Stezkoy\FlarumDoorquest\Api\Resource;

use Flarum\Api\Endpoint;
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Api\Sort\SortColumn;
use Stezkoy\FlarumDoorquest\Question;
use Stezkoy\FlarumDoorquest\Events\QuestionCreated;
use Stezkoy\FlarumDoorquest\Events\QuestionDeleted;
use Stezkoy\FlarumDoorquest\Events\QuestionUpdated;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Tobyz\JsonApiServer\Context as OriginalContext;

/**
 * @extends Resource\AbstractDatabaseResource<Question>
 */
class QuestionResource extends Resource\AbstractDatabaseResource
{
    public function type(): string
    {
        return 'doorquest-questions';
    }

    public function model(): string
    {
        return Question::class;
    }

    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->whereVisibleTo($context->getActor());
    }

    public function endpoints(): array
    {
        return [
            Endpoint\Show::make()
                ->admin()
                ->defaultInclude(['group', 'createdBy']),

            Endpoint\Index::make()
                ->admin()
                ->defaultInclude(['group', 'createdBy'])
                ->defaultSort('-id')
                ->paginate(),

            Endpoint\Create::make()
                ->admin(),

            Endpoint\Update::make()
                ->admin(),

            Endpoint\Delete::make()
                ->admin(),
        ];
    }

    public function fields(): array
    {
        return [
            Schema\Str::make('question')
                ->writable()
                ->requiredOnCreate(),

            Schema\Str::make('answer')
                ->writable()
                ->requiredOnCreate(),

            Schema\Integer::make('groupId')
                ->writable()
                ->requiredOnCreate()
                ->rule('exists:groups,id'),

            Schema\Integer::make('maxUses')
                ->writable()
                ->rule('min:0'),

            Schema\Boolean::make('activates')
                ->writable(),

            Schema\Integer::make('uses'),

            Schema\Relationship\ToOne::make('group')
                ->includable()
                ->type('groups'),

            Schema\Relationship\ToOne::make('createdBy')
                ->includable()
                ->type('users'),
        ];
    }

    public function sorts(): array
    {
        return [
            SortColumn::make('id'),
            SortColumn::make('question'),
            SortColumn::make('uses'),
            SortColumn::make('maxUses'),
        ];
    }

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->created_by = $context->getActor()->id;
        $model->uses ??= 0;

        return $model;
    }

    public function created(object $model, OriginalContext $context): ?object
    {
        $this->events->dispatch(
            new QuestionCreated($model, $context->getActor(), (array) Arr::get($context->body(), 'data', []))
        );

        return $model;
    }

    public function updated(object $model, OriginalContext $context): ?object
    {
        $this->events->dispatch(
            new QuestionUpdated($model, $context->getActor(), (array) Arr::get($context->body(), 'data', []))
        );

        return $model;
    }

    public function deleted(object $model, OriginalContext $context): void
    {
        $this->events->dispatch(
            new QuestionDeleted($model, $context->getActor(), [])
        );
    }
}
