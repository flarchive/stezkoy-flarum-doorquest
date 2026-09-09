import Form from 'flarum/common/components/Form';
import app from 'flarum/admin/app';
import { IFormModalAttrs } from 'flarum/common/components/FormModal';
import FormModal from 'flarum/common/components/FormModal';
import Button from 'flarum/common/components/Button';
import ItemList from 'flarum/common/utils/ItemList';
import Stream from 'flarum/common/utils/Stream';
import Switch from 'flarum/common/components/Switch';
import Select from 'flarum/common/components/Select';
import Group from 'flarum/common/models/Group';

import type Mithril from 'mithril';

export interface ICreateQuestionModalAttrs extends IFormModalAttrs {
  oncreated?: () => void;
}

export default class CreateQuestionModal<CustomAttrs extends ICreateQuestionModalAttrs = ICreateQuestionModalAttrs> extends FormModal<CustomAttrs> {
  question!: Stream<string>;
  answer!: Stream<string>;
  groupId!: Stream<number>;
  maxUses!: Stream<number>;
  activates!: Stream<boolean>;
  bulkAdd!: Stream<boolean>;

  oninit(vnode: Mithril.Vnode<CustomAttrs, this>) {
    super.oninit(vnode);

    this.question = Stream('');
    this.answer = Stream('');
    this.groupId = Stream(3);
    this.maxUses = Stream(10);
    this.activates = Stream(false);
    this.bulkAdd = Stream(false);
  }

  className() {
    return 'Modal--small CreateQuestionModal';
  }

  title() {
    return app.translator.trans('stezkoy-doorquest.admin.modals.create_question.title');
  }

  content() {
    return (
      <div className="Modal-body">
        <Form>{this.fields().toArray()}</Form>
      </div>
    );
  }

  fields(): ItemList<Mithril.Children> {
    const items = new ItemList<Mithril.Children>();

    items.add(
      'question',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.question.label')}</label>
        <div className="helpText">{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.question.help')}</div>
        <textarea className="FormControl" name="question" bidi={this.question} disabled={this.loading} rows={3} />
      </div>,
      100
    );

    items.add(
      'answer',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.answer.label')}</label>
        <div className="helpText">{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.answer.help')}</div>
        <input className="FormControl" name="answer" type="text" bidi={this.answer} disabled={this.loading} />
      </div>,
      90
    );

    items.add(
      'group',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.group.label')}</label>
        <div className="helpText">{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.group.help')}</div>
        <Select
          name="groupId"
          options={this.getGroupsForInput()}
          value={String(this.groupId())}
          onchange={(val: string) => this.groupId(Number(val))}
          disabled={this.loading}
        />
      </div>,
      80
    );

    items.add(
      'maxUses',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.max_uses.label')}</label>
        <div className="helpText">{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.max_uses.help')}</div>
        <input className="FormControl" name="maxUses" type="number" bidi={this.maxUses} disabled={this.loading} />
      </div>,
      70
    );

    items.add(
      'activates',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.activates_user.label')}</label>
        <div className="helpText">{app.translator.trans('stezkoy-doorquest.admin.modals.create_question.activates_user.help')}</div>
        <Switch name="activates" state={this.activates()} onchange={(checked: boolean) => this.activates(checked)} disabled={this.loading}>
          {'‎'}
        </Switch>
      </div>,
      60
    );

    items.add(
      'submit',
      <div className="Form-group">
        <Button className="Button Button--primary Button--block" type="submit" loading={this.loading}>
          {app.translator.trans('stezkoy-doorquest.admin.modals.create_question.submit_button')}
        </Button>
      </div>,
      0
    );

    items.add(
      'submitAndAdd',
      <div className="Form-group">
        <Button className="Button Button--block" onclick={() => this.bulkAdd(true) && this.onsubmit()} disabled={this.loading}>
          {app.translator.trans('stezkoy-doorquest.admin.modals.create_question.submit_and_create_another_button')}
        </Button>
      </div>,
      -20
    );

    return items;
  }

  getGroupsForInput() {
    let options: { [key: string]: string } = {};

    app.store.all('groups').map((group) => {
      const groupCasted = group as Group;
      if (groupCasted.id() === Group.GUEST_ID) {
        return;
      }
      options[groupCasted.id() as string] = groupCasted.nameSingular();
    });

    return options;
  }

  onsubmit(e: SubmitEvent | null = null) {
    e?.preventDefault();

    this.loading = true;

    app
      .request({
        url: app.forum.attribute('apiUrl') + '/doorquest-questions',
        method: 'POST',
        body: { data: { attributes: this.submitData() } },
        errorHandler: this.onerror.bind(this),
      })
      .then(() => {
        this.attrs.oncreated?.();

        if (this.bulkAdd()) {
          this.resetData();
        } else {
          this.hide();
        }
      })
      .finally(() => {
        this.bulkAdd(false);
        this.loaded();
      });
  }

  submitData() {
    return {
      question: this.question().trim(),
      answer: this.answer().trim(),
      groupId: this.groupId(),
      maxUses: this.maxUses(),
      activates: this.activates(),
    };
  }

  resetData() {
    this.question('');
    this.answer('');
    this.groupId(3);
    this.maxUses(10);
    this.activates(false);
  }
}
