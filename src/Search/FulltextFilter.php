<?php

namespace Stezkoy\FlarumDoorquest\Search;

use Flarum\Search\AbstractFulltextFilter;
use Flarum\Search\SearchState;

/**
 * @extends AbstractFulltextFilter<\Flarum\Search\Database\DatabaseSearchState>
 */
class FulltextFilter extends AbstractFulltextFilter
{
    public function search(SearchState $state, string $value): void
    {
        $state->getQuery()->where(function ($query) use ($value) {
            $query->where('doorquest_questions.question', 'like', "%{$value}%")
                ->orWhere('doorquest_questions.answer', 'like', "%{$value}%");
        });
    }
}
