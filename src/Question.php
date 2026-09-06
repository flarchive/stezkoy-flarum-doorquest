<?php

namespace Stezkoy\FlarumDoorquest;

use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;
use Flarum\Group\Group;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string    $question
 * @property string    $answer
 * @property int       $group_id
 * @property int       $max_uses
 * @property int       $activates
 * @property int       $uses
 * @property int       $created_by
 */
class Question extends AbstractModel
{
    use ScopeVisibilityTrait;

    protected $table = 'doorquest_questions';

    /**
     * Normalize the answer attribute on write: trim whitespace and uppercase.
     */
    public function setAnswerAttribute($value): void
    {
        $this->attributes['answer'] = strtoupper(trim((string) $value));
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
