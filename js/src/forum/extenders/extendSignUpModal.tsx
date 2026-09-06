import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Stream from 'flarum/common/utils/Stream';
import Mithril from 'mithril';

let cachedQuestion: { id: number; question: string } | null = null;
let questionPromise: Promise<void> | null = null;

function fetchRandomQuestion(): Promise<void> {
  if (questionPromise) return questionPromise;

  questionPromise = app
    .request<{ data: { id: string; attributes: { question: string } } }>({
      url: app.forum.attribute('apiUrl') + '/doorquest/random',
      method: 'GET',
    })
    .then((response: any) => {
      if (response && response.data) {
        cachedQuestion = {
          id: parseInt(response.data.id),
          question: response.data.attributes.question,
        };
      }
    })
    .catch(() => {
      cachedQuestion = null;
    });

  return questionPromise;
}

export default function extendSignUpModal() {
  extend('flarum/forum/components/SignUpModal', 'oninit', function () {
    this.doorquestAnswer = Stream('');
    this.doorquestQuestion = null;

    fetchRandomQuestion().then(() => {
      this.doorquestQuestion = cachedQuestion;
      m.redraw();
    });
  });

  extend('flarum/forum/components/SignUpModal', 'fields', function (fields) {
    const question = this.doorquestQuestion;

    if (!question) {
      return;
    }

    fields.add(
      'doorquest',
      <div className="Form-group">
        <label>{app.translator.trans('stezkoy-doorquest.forum.sign_up.question_label')}</label>
        <p className="Doorquest-question-text" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {question.question}
        </p>
        <input
          className="FormControl"
          name="fof-doorquest-answer"
          type="text"
          placeholder={app.translator.trans('stezkoy-doorquest.forum.sign_up.answer_placeholder')}
          bidi={this.doorquestAnswer}
          disabled={this.loading}
        />
      </div>
    );
  });

  extend('flarum/forum/components/SignUpModal', 'submitData', function (data) {
    const question = this.doorquestQuestion;
    if (question) {
      data['fof-doorquest-id'] = String(question.id);
      data['fof-doorquest-answer'] = this.doorquestAnswer().trim();
    }
    return data;
  });
}
