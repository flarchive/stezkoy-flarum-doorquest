import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import extendSignUpModal from './extenders/extendSignUpModal';

app.initializers.add('stezkoy-doorquest', () => {
  extendSignUpModal();
});
