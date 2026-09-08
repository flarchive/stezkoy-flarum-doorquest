<?php

namespace Stezkoy\FlarumDoorquest\Events;

use Flarum\User\User;
use Stezkoy\FlarumDoorquest\Question;

abstract class AbstractQuestionEvent
{
    public function __construct(public Question $question, public User $actor, public array $data)
    {
    }
}
