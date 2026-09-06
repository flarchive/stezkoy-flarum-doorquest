<?php

namespace Stezkoy\FlarumDoorquest\Listeners;

use Flarum\User\Event\Saving;
use Stezkoy\FlarumDoorquest\Repository\QuestionRepository;
use Stezkoy\FlarumDoorquest\Validators\AnswerValidator;
use Illuminate\Support\Arr;

class ValidateAnswer
{
    public function __construct(
        protected AnswerValidator $validator,
        protected QuestionRepository $questions,
    ) {
    }

    public function handle(Saving $event): void
    {
        if (!$event->user->exists) {
            $questionId = Arr::get($event->data, 'attributes.fof-doorquest-id');
            $answer = strtoupper(trim((string) Arr::get($event->data, 'attributes.fof-doorquest-answer')));

            if (!$questionId || !$answer) {
                return;
            }

            $this->validator->assertValid([
                'fof-doorquest-id' => $questionId,
                'fof-doorquest-answer' => $answer,
            ]);

            $event->user->doorquest_answer = $answer;

            $question = $this->questions->getById((int) $questionId);

            if (!$question) {
                return;
            }

            $event->user->doorquest_question_id = $question->id;

            if ($question->activates) {
                $event->user->activate();
            }
        }
    }
}
