<?php

namespace Stezkoy\FlarumDoorquest\Validators;

use Flarum\Foundation\AbstractValidator;

class AnswerValidator extends AbstractValidator
{
    protected array $rules = [
        'fof-doorquest-id' => ['required', 'integer'],
        'fof-doorquest-answer' => ['required', 'doorquest_answer'],
    ];

    protected function getMessages(): array
    {
        $translator = resolve('translator');

        return [
            'doorquest_answer' => $translator->trans('stezkoy-doorquest.forum.sign_up.invalid_answer'),
            'required' => $translator->trans('stezkoy-doorquest.forum.sign_up.answer_required'),
        ];
    }
}
