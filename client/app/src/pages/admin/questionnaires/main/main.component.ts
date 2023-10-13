import {HttpClient} from "@angular/common/http";
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {questionnaireResolverModel} from "app/src/models/resolvers/questionnaireModel";
import {QuestionnairesResolver} from "app/src/shared/resolvers/questionnaires.resolver";
import {HttpService} from "app/src/shared/services/http.service";
import {UtilsService} from "app/src/shared/services/utils.service";
import {new_questionare} from "@app/models/admin/new_questionare";
import {QuestionnaireService} from "../questionnaire.service";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: "src-main",
  templateUrl: "./main.component.html"
})
export class MainComponent implements OnInit, OnDestroy {

  questionnairesData: any = [];
  new_questionnaire: { name: string } = {name: ""};
  showAddQuestionnaire: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private questionnaireService: QuestionnaireService, private httpService: HttpService, private utilsService: UtilsService, private cdr: ChangeDetectorRef, protected questionnairesResolver: QuestionnairesResolver) {
  }

  ngOnInit(): void {
    this.questionnaireService.getData().pipe(takeUntil(this.destroy$)).subscribe(() => {
      return this.getResolver();
    });
    this.questionnairesData = this.questionnairesResolver.dataModel;
    this.cdr.markForCheck();
  }

  add_questionnaire() {
    const questionnaire: new_questionare = new new_questionare();
    questionnaire.name = this.new_questionnaire.name;
    this.httpService.addQuestionare(questionnaire).subscribe(res => {
      this.questionnairesData.push(res);
      this.new_questionnaire = {name: ""};
      this.getResolver();
      this.cdr.markForCheck();
    });
  }

  toggleAddQuestionnaire(): void {
    this.showAddQuestionnaire = !this.showAddQuestionnaire;
  }

  importQuestionnaire(file: any) {
    this.utilsService.readFileAsText(file[0]).then((txt) => {
      return this.http.post("api/admin/questionnaires?multilang=1", txt).subscribe(() => {
        this.getResolver();
      });
    });
  }

  deleteRequest(questionnaire: any) {
    if (questionnaire) {
      this.questionnairesData.splice(this.questionnairesData.indexOf(questionnaire), 1);
    }
    this.getResolver();
    this.cdr.markForCheck();
  }

  listenToQuestionnairesList() {
  }

  getResolver() {
    return this.httpService.requestQuestionnairesResource().subscribe(response => {
      this.questionnairesResolver.dataModel = response;
      this.questionnairesData = response;
      this.cdr.markForCheck();
    });
  }

  trackByFn(_: number, item: questionnaireResolverModel) {
    return item.id;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}