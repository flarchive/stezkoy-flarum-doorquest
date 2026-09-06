<?php

namespace Stezkoy\FlarumDoorquest\Listeners;

use Flarum\Foundation\AbstractValidator;
use Stezkoy\FlarumDoorquest\Repository\QuestionRepository;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator;

class AddValidatorRule
{
    public function __construct(protected QuestionRepository $questions)
    {
    }

    public function __invoke(AbstractValidator $flarumValidator, Validator $validator): void
    {
        $validator->addExtension(
            'doorquest_answer',
            function ($attribute, $value, $parameters) use ($validator): bool {
                $id = Arr::get($validator->getData(), 'fof-doorquest-id');

                if (!$id) {
                    return false;
                }

                $question = $this->questions->getById((int) $id);

                if (!$question) {
                    return false;
                }

                if ($question->max_uses > 0 && $question->uses >= $question->max_uses) {
                    return false;
                }

                $normalized = strtoupper(trim((string) $value));

                return $normalized !== '' && $normalized === $question->answer;
            }
        );
    }
}
