<?php

namespace Stezkoy\FlarumDoorquest\Search;

use Flarum\Search\Database\AbstractSearcher;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;
use Stezkoy\FlarumDoorquest\Question;

class QuestionSearcher extends AbstractSearcher
{
    public function getQuery(User $actor): Builder
    {
        return Question::query()->whereVisibleTo($actor);
    }
}
