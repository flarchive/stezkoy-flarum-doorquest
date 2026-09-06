<?php

namespace Stezkoy\FlarumDoorquest\Repository;

use Stezkoy\FlarumDoorquest\Question;
use Illuminate\Database\Eloquent\Builder;

class QuestionRepository
{
    public function query(): Builder
    {
        return Question::query();
    }

    public function getById(int $id): ?Question
    {
        return $this->query()->find($id);
    }

    public function getRandomQuestion(): ?Question
    {
        return $this->query()
            ->where(function (Builder $query) {
                $query->where('max_uses', 0)
                    ->orWhereColumn('uses', '<', 'max_uses');
            })
            ->inRandomOrder()
            ->first();
    }
}
