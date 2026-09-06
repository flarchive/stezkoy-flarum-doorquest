import Extend from 'flarum/common/extenders';
import Question from '../common/models/Question';
import QuestionListPage from './components/QuestionListPage';

export default [
  new Extend.Store() //
    .add('doorquest-questions', Question),

  new Extend.Admin() //
    .page(QuestionListPage),
];
