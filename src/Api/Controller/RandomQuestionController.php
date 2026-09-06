<?php

namespace Stezkoy\FlarumDoorquest\Api\Controller;

use Flarum\Http\SessionAuthenticator;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Stezkoy\FlarumDoorquest\Repository\QuestionRepository;

class RandomQuestionController implements RequestHandlerInterface
{
    public function __construct(
        protected QuestionRepository $questions,
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $question = $this->questions->getRandomQuestion();

        if (! $question) {
            return new JsonResponse(['data' => null], 200);
        }

        return new JsonResponse([
            'data' => [
                'id' => (string) $question->id,
                'attributes' => [
                    'question' => $question->question,
                ],
            ],
        ], 200);
    }
}
