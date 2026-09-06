<?php

namespace Stezkoy\FlarumDoorquest\Listeners;

use Flarum\User\Event\GroupsChanged;
use Flarum\User\Event\Registered;
use Stezkoy\FlarumDoorquest\Events\QuestionUsed;
use Stezkoy\FlarumDoorquest\Repository\QuestionRepository;
use Illuminate\Contracts\Events\Dispatcher;

class PostRegisterOperations
{
    public function __construct(
        protected QuestionRepository $questions,
        protected Dispatcher $events,
    ) {
    }

    public function handle(Registered $event): void
    {
        $user = $event->user;

        $questionId = (int) $user->doorquest_question_id;

        if (!$questionId) {
            return;
        }

        $question = $this->questions->getById((int) $questionId);

        if (!$question) {
            return;
        }

        if ($question->group_id && $question->group_id !== 3) {
            $oldGroups = $user->groups()->get()->all();

            $user->groups()->attach($question->group_id);

            $this->events->dispatch(
                new GroupsChanged($user, $oldGroups)
            );
        }

        $user->save();

        $question->increment('uses');

        $this->events->dispatch(
            new QuestionUsed($question, $user, [])
        );
    }
}
