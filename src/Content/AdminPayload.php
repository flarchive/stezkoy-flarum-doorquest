<?php

namespace Stezkoy\FlarumDoorquest\Content;

use Flarum\Frontend\Document;
use Psr\Http\Message\ServerRequestInterface as Request;
use Stezkoy\FlarumDoorquest\Question;

class AdminPayload
{
    public function __invoke(Document $document, Request $request): void
    {
        $document->payload['modelStatistics'] = array_merge(
            $document->payload['modelStatistics'] ?? [],
            [
                'doorquestQuestions' => [
                    'total' => Question::query()->count(),
                ],
            ]
        );
    }
}
