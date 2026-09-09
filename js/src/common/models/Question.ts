import Model from 'flarum/common/Model';

export default class Question extends Model {
  question = Model.attribute<string>('question');
  answer = Model.attribute<string>('answer');
  groupId = Model.attribute<number>('groupId');
  maxUses = Model.attribute<number>('maxUses');
  activates = Model.attribute<boolean>('activates');
  uses = Model.attribute<number>('uses');

  group = Model.hasOne('group');
  createdBy = Model.hasOne('createdBy');
}
