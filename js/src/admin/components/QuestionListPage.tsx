import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import { debounce } from 'flarum/common/utils/throttleDebounce';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Button from 'flarum/common/components/Button';
import ItemList from 'flarum/common/utils/ItemList';
import classList from 'flarum/common/utils/classList';
import extractText from 'flarum/common/utils/extractText';
import GroupBadge from 'flarum/common/components/GroupBadge';
import Group from 'flarum/common/models/Group';
import Icon from 'flarum/common/components/Icon';
import Badge from 'flarum/common/components/Badge';

import type { ExtensionPageAttrs } from 'flarum/admin/components/ExtensionPage';
import type Question from 'src/common/models/Question';
import type Mithril from 'mithril';

export type ColumnData = {
  name: Mithril.Children;
  content: (question: Question) => Mithril.Children;
};

export default class QuestionListPage extends ExtensionPage {
  private query: string = '';
  private throttledSearch = debounce(250, () => this.loadPage(0));

  private numPerPage: number = 10;
  private pageNumber: number = 0;
  private loadingPageNumber: number = 0;
  readonly questionCount: number = app.data.modelStatistics.doorquestQuestions.total;

  loadingDelete: { [key: string]: boolean } = {};

  private getTotalPageCount(): number {
    if (this.questionCount === -1) return 0;
    return Math.ceil(this.questionCount / this.numPerPage);
  }

  private pageData: Question[] | undefined = undefined;
  private moreData: boolean = false;
  private isLoadingPage: boolean = false;

  oninit(vnode: Mithril.Vnode<ExtensionPageAttrs, this>) {
    super.oninit(vnode);

    const page = parseInt(m.route.param('page'));

    if (isNaN(page) || page < 1) {
      this.setPageNumberInUrl(1);
      this.pageNumber = 0;
    } else {
      this.pageNumber = page - 1;
    }

    this.loadingPageNumber = this.pageNumber;
  }

  content(): JSX.Element {
    if (typeof this.pageData === 'undefined') {
      this.loadPage(this.pageNumber);

      return (
        <section className="DoorquestListPage-grid DoorquestListPage-grid--loading">
          <LoadingIndicator containerClassName="LoadingIndicator--block" size="large" />
        </section>
      );
    }

    const columns = this.columns().toArray();

    return (
      <div className="ExtensionPage-settings">
        <div className="container">
          <section className="DoorquestListPage-section DoorquestListPage-section--list">
            <header className="DoorquestListPage-section-header">
              <div className="DoorquestListPage-section-titleGroup">
                <h3 className="DoorquestListPage-section-title">{app.translator.trans('stezkoy-doorquest.admin.list.heading')}</h3>
                <span className="DoorquestListPage-totalQuestions">
                  {app.translator.trans('stezkoy-doorquest.admin.settings.total_questions', { count: this.questionCount })}
                </span>
              </div>
              <div>{this.actionItems().toArray()}</div>
            </header>

            <div className="DoorquestListPage-toolbar">{this.headerItems().toArray()}</div>

            <section
              className={classList([
                'DoorquestListPage-cardList',
                this.isLoadingPage ? 'DoorquestListPage-cardList--loading' : 'DoorquestListPage-cardList--loaded',
              ])}
            >
              <div className="DoorquestListPage-cardList-header">
                {columns.map((column) => (
                  <span key={column.itemName}>{column.name}</span>
                ))}
              </div>

              {this.pageData.map((question) => (
                <div className="DoorquestListPage-cardList-item" data-question-id={question.id()}>
                  {columns.map((col) => {
                    const columnContent = col.content && col.content(question);
                    return (
                      <div
                        className="DoorquestListPage-cardList-item-cell"
                        data-label={extractText(col.name)}
                        data-column-name={col.itemName}
                      >
                        {columnContent ?? app.translator.trans('stezkoy-doorquest.admin.list.content.invalid_column')}
                      </div>
                    );
                  })}
                </div>
              ))}

              {this.isLoadingPage && <LoadingIndicator size="large" />}
            </section>

            <nav className="DoorquestListPage-gridPagination">
              <Button
                disabled={this.pageNumber === 0}
                aria-label={app.translator.trans('stezkoy-doorquest.admin.list.pagination.first_page_button')}
                title={app.translator.trans('stezkoy-doorquest.admin.list.pagination.first_page_button')}
                onclick={this.goToPage.bind(this, 1)}
                icon="fas fa-step-backward"
                className="Button Button--icon"
              />
              <Button
                disabled={this.pageNumber === 0}
                aria-label={app.translator.trans('stezkoy-doorquest.admin.list.pagination.back_button')}
                title={app.translator.trans('stezkoy-doorquest.admin.list.pagination.back_button')}
                onclick={this.previousPage.bind(this)}
                icon="fas fa-chevron-left"
                className="Button Button--icon"
              />
              <span className="DoorquestListPage-pageNumber">
                {app.translator.trans('stezkoy-doorquest.admin.list.pagination.page_counter', {
                  current: (
                    <input
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      value={this.loadingPageNumber + 1}
                      autocomplete="off"
                      className="FormControl DoorquestListPage-pageNumberInput"
                      onchange={(e: InputEvent) => {
                        const target = e.target as HTMLInputElement;
                        let pageNumber = parseInt(target.value);

                        if (isNaN(pageNumber)) {
                          target.value = (this.pageNumber + 1).toString();
                          return;
                        }

                        if (pageNumber < 1) pageNumber = 1;
                        else if (pageNumber > this.getTotalPageCount()) pageNumber = this.getTotalPageCount();

                        target.value = pageNumber.toString();
                        this.goToPage(pageNumber);
                      }}
                    />
                  ),
                  currentNum: this.pageNumber + 1,
                  total: this.getTotalPageCount(),
                })}
              </span>
              <Button
                disabled={!this.moreData}
                aria-label={app.translator.trans('stezkoy-doorquest.admin.list.pagination.next_button')}
                title={app.translator.trans('stezkoy-doorquest.admin.list.pagination.next_button')}
                onclick={this.nextPage.bind(this)}
                icon="fas fa-chevron-right"
                className="Button Button--icon"
              />
              <Button
                disabled={!this.moreData}
                aria-label={app.translator.trans('stezkoy-doorquest.admin.list.pagination.last_page_button')}
                title={app.translator.trans('stezkoy-doorquest.admin.list.pagination.last_page_button')}
                onclick={this.goToPage.bind(this, this.getTotalPageCount())}
                icon="fas fa-step-forward"
                className="Button Button--icon"
              />
            </nav>
          </section>
        </div>
      </div>
    );
  }

  headerItems(): ItemList<Mithril.Children> {
    const items = new ItemList<Mithril.Children>();

    items.add(
      'search',
      <div className="Search-input">
        <input
          className="FormControl SearchBar"
          type="search"
          placeholder={app.translator.trans('stezkoy-doorquest.admin.settings.search')}
          oninput={(e: InputEvent) => {
            this.isLoadingPage = true;
            this.query = (e?.target as HTMLInputElement)?.value;
            this.throttledSearch();
          }}
        />
      </div>,
      100
    );

    return items;
  }

  actionItems(): ItemList<Mithril.Children> {
    const items = new ItemList<Mithril.Children>();

    items.add(
      'createQuestion',
      <Button
        className="Button"
        icon="fas fa-plus"
        onclick={() => app.modal.show(() => import('./CreateQuestionModal'), { oncreated: () => this.loadPage(this.pageNumber) })}
      >
        {app.translator.trans('stezkoy-doorquest.admin.settings.create_question_button')}
      </Button>,
      100
    );

    return items;
  }

  columns(): ItemList<ColumnData> {
    const columns = new ItemList<ColumnData>();

    columns.add(
      'id',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.id'),
        content: (question: Question) => question.id(),
      },
      100
    );

    columns.add(
      'question',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.question'),
        content: (question: Question) => {
          const text = question.question() || '';
          return text.length > 60 ? text.substring(0, 60) + '...' : text;
        },
      },
      90
    );

    columns.add(
      'answer',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.answer'),
        content: (question: Question) => question.answer() ?? null,
      },
      85
    );

    columns.add(
      'group',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.group'),
        content: (question: Question) => {
          const group = question.group();
          if (group && group.id() === Group.MEMBER_ID) return app.translator.trans('stezkoy-doorquest.admin.list.content.no_group');
          return <GroupBadge group={question.group()} />;
        },
      },
      80
    );

    columns.add(
      'maxUses',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.max_uses'),
        content: (question: Question) => question.maxUses() ?? null,
      },
      70
    );

    columns.add(
      'activates',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.activates_user'),
        content: (question: Question) => {
          return question.activates() ? <Icon name="fas fa-user-check" /> : <Icon name="fas fa-times-circle" />;
        },
      },
      60
    );

    columns.add(
      'manage',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.manage'),
        content: (question: Question) => (
          <>
            <Button
              aria-label={app.translator.trans('stezkoy-doorquest.admin.list.actions.edit')}
              className="Button Button--icon Doorquest-button"
              icon="fas fa-pencil-alt"
              onclick={() => app.modal.show(() => import('./EditQuestionModal'), { question })}
            />
            <Button
              aria-label={app.translator.trans('stezkoy-doorquest.admin.list.actions.delete')}
              className="Button Button--danger Button--icon"
              icon={`fas ${this.loadingDelete[question.id() || ''] ? 'fa-circle-notch fa-spin' : 'fa-times'} fa-fw`}
              onclick={() => this.deleteQuestion(question)}
            />
          </>
        ),
      },
      50
    );

    columns.add(
      'uses',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.uses'),
        content: (question: Question) => {
          const maxUses = question.maxUses();
          const totalUses = question.uses();

          if (maxUses <= 0) {
            return (
              <b>{app.translator.trans('stezkoy-doorquest.admin.list.content.uses.total_uses', { totalUses })}</b>
            );
          }

          if (totalUses >= maxUses) {
            return Badge.component({
              className: 'Button--icon Doorquest-badge',
              icon: 'fas fa-user-slash',
              label: app.translator.trans('stezkoy-doorquest.admin.list.content.warning'),
            });
          }

          const remainingUses = maxUses - totalUses;

          return (
            <b>{app.translator.trans('stezkoy-doorquest.admin.list.content.uses.used_times', { remainingUses })}</b>
          );
        },
      },
      40
    );

    columns.add(
      'createdBy',
      {
        name: app.translator.trans('stezkoy-doorquest.admin.list.columns.created_by'),
        content: (question: Question) => {
          const user = question.createdBy();

          if (!user) return app.translator.trans('stezkoy-doorquest.admin.list.content.no_created_by');

          const profileUrl = `${app.forum.attribute('baseUrl')}/u/${user.slug()}`;

          return (
            <a target="_blank" href={profileUrl}>
              {user.displayName()}
            </a>
          );
        },
      },
      30
    );

    return columns;
  }

  async loadPage(pageNumber: number) {
    if (pageNumber < 0) pageNumber = 0;

    this.loadingPageNumber = pageNumber;
    this.setPageNumberInUrl(pageNumber + 1);

    app.store
      .find<Question[]>('doorquest-questions', {
        filter: { q: this.query },
        page: {
          limit: this.numPerPage,
          offset: pageNumber * this.numPerPage,
        },
      })
      .then((apiData) => {
        this.moreData = !!apiData.payload?.links?.next;

        let data = apiData;
        // @ts-ignore
        delete data.payload;

        const lastPage = this.getTotalPageCount();

        if (pageNumber > lastPage) {
          this.loadPage(lastPage - 1);
        } else {
          this.pageData = data;
          this.pageNumber = pageNumber;
          this.loadingPageNumber = pageNumber;
          this.isLoadingPage = false;
        }

        m.redraw();
      })
      .catch((err: Error) => {
        console.error(err);
        this.pageData = [];
      });
  }

  nextPage() {
    this.isLoadingPage = true;
    this.loadPage(this.pageNumber + 1);
  }

  previousPage() {
    this.isLoadingPage = true;
    this.loadPage(this.pageNumber - 1);
  }

  goToPage(page: number) {
    this.isLoadingPage = true;
    this.loadPage(page - 1);
  }

  private setPageNumberInUrl(pageNumber: number) {
    const search = window.location.hash.split('?', 2);
    const params = new URLSearchParams(search?.[1] ?? '');
    params.set('page', `${pageNumber}`);
    window.location.hash = search?.[0] + '?' + params.toString();
  }

  deleteQuestion(question: Question) {
    if (!confirm(extractText(app.translator.trans('stezkoy-doorquest.admin.list.content.delete', { question: question.question() })))) return;

    const questionId = question.id();
    if (questionId) {
      this.loadingDelete[questionId] = true;
      m.redraw();

      question.delete().finally(() => {
        this.loadingDelete[questionId] = false;
        window.location.reload();
        m.redraw();
      });
    }
  }
}
