import {AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {AppDataService} from "@app/app-data.service";
import {FieldUtilitiesService} from "@app/shared/services/field-utilities.service";
import {SubmissionService} from "@app/services/submission.service";
import {UtilsService} from "@app/shared/services/utils.service";
import {AuthenticationService} from "@app/services/authentication.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: "src-submission",
  templateUrl: "./submission.component.html",
  providers: [SubmissionService]
})
export class SubmissionComponent implements OnInit, AfterViewInit{
  @ViewChild("submissionForm") public submissionForm: NgForm;
  @ViewChildren("stepform") stepForms: QueryList<NgForm>;

  isLoaded = false;
  answers: any = {};
  stepFormList: any = {};
  identity_provided = false;
  context_id = "";
  context: any = undefined;
  receiversOrderPredicate: any;
  navigation = -1;
  validate: any = [];
  score = 0;
  done: boolean;
  uploads: any = {};
  field_id_map: any;
  questionnaire: any;
  receiver_selection_step: number;
  contextsOrderPredicate = this.appDataService.public.node.show_contexts_in_alphabetical_order ? "name" : "order";
  selectable_contexts: any[];
  submission: SubmissionService;
  show_steps_navigation_bar = false;
  receivedData: any;

  constructor(protected authenticationService: AuthenticationService, private appDataService: AppDataService, private utilsService: UtilsService, private fieldUtilitiesService: FieldUtilitiesService, private submissionService: SubmissionService, private cdr: ChangeDetectorRef) {
    this.selectable_contexts = [];
    this.receivedData = this.submissionService.getSharedData();
  }

  ngAfterViewInit(): void {
    this.initializeSubmission();
    this.isLoaded = true;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.resetForm();
  }

  firstStepIndex() {
    return this.receiver_selection_step ? -1 : 0;
  };

  prepareSubmission(context: any) {
    this.done = false;
    this.answers = {};
    this.uploads = {};
    this.questionnaire = context.questionnaire;

    this.submission.create(context.id);
    this.context = context;
    this.fieldUtilitiesService.onAnswersUpdate(this);

    this.field_id_map = this.fieldUtilitiesService.build_field_id_map(this.questionnaire);
    this.show_steps_navigation_bar = this.context.allow_recipients_selection || this.questionnaire.steps.length > 1;
    this.receiversOrderPredicate = this.submission.context.show_receivers_in_alphabetical_order ? "name" : null;

    if (this.context.allow_recipients_selection) {
      this.navigation = -1;
    } else {
      this.navigation = 0;
    }
  }

  selectable() {
    if (this.submission.context.maximum_selectable_receivers === 0) {
      return true;
    }
    return Object.keys(this.submission.selected_receivers).length < this.submission.context.maximum_selectable_receivers;
  };

  switch_selection(receiver: any) {
    if (receiver.forcefully_selected) {
      return;
    }

    if (this.submission.selected_receivers[receiver.id]) {
      delete this.submission.selected_receivers[receiver.id];
    } else if (this.selectable()) {
      this.submission.selected_receivers[receiver.id] = true;
    }
  };

  onFieldUpdated() {
  }

  selectContext(context: any) {
    this.context = context;
    this.prepareSubmission(context);
  }

  initializeSubmission() {
    this.submission = this.submissionService;
    let context = null;

    this.selectable_contexts = this.appDataService.public.contexts.filter(context => !context.hidden);

    if (this.context_id) {
      context = this.appDataService.public.contexts.find(context => context.id === this.context);
      this.prepareSubmission(context);
    } else if (this.selectable_contexts.length === 1) {
      context = this.selectable_contexts[0];
      this.prepareSubmission(context);
    }
  }

  goToStep(step: number) {
    this.navigation = step;
    this.utilsService.scrollToTop();
  }

  hasPreviousStep() {
    if (typeof this.context === "undefined") {
      return false;
    }

    return this.navigation > this.firstStepIndex();
  };

  areReceiversSelected() {
    return Object.keys(this.submission.selected_receivers).length > 0;
  };

  hasNextStep() {
    return this.navigation < this.lastStepIndex();
  }

  singleStepForm() {
    return this.firstStepIndex() === this.lastStepIndex();
  };

  initStepForm(form: NgForm, id: any) {
    this.stepFormList[id] = form;
  }

  stepForm(index: any): any {
    if (this.stepForms && index !== -1) {
      return this.stepForms.get(index);
    }
  };

  displayStepErrors(index: number): any {
    if (index !== -1) {
      const response = this.stepForm(index);
      if (response) {
        return response?.invalid;
      } else {
        return false;
      }
    }
  };

  lastStepIndex() {
    let last_enabled = 0;
    if (this.questionnaire) {

      for (let i = 0; i < this.questionnaire.steps.length; i++) {
        if (this.fieldUtilitiesService.isFieldTriggered(null, this.questionnaire.steps[i], this.answers, this.score)) {
          last_enabled = i;
        }
      }

    }
    return last_enabled;
  };

  submissionHasErrors() {
    if (this.submissionForm) {
      return this.submissionForm.invalid || this.utilsService.isUploading(this.uploads);
    }

    return false;
  };

  uploading() {
    let uploading = false;
    if (this.uploads && this.done) {
      for (const key in this.uploads) {
        if (this.uploads[key].flowJs && this.uploads[key].flowJs.isUploading()) {
          uploading = true;
        }
      }
    }

    return uploading;
  }

  calculateEstimatedTime() {
    let timeRemaining = 0;
    if (this.uploads && this.done) {
      for (const key in this.uploads) {
        if (this.uploads[key] && this.uploads[key].flowJs) {
          timeRemaining += this.uploads[key].flowJs.timeRemaining();
        }
      }
    }

    if (!isFinite(timeRemaining)) {
      timeRemaining = 0;
    }
    return timeRemaining;
  }

  calculateProgress() {
    let progress = 0;
    if (this.uploads && this.done) {
      for (const key in this.uploads) {
        if (this.uploads[key] && this.uploads[key].flowJs) {
          progress += this.uploads[key].flowJs.progress();
        }
      }
    }
    if (!isFinite(progress)) {
      progress = 0;
    }
    return progress;
  }

  displayErrors() {
    if (!(this.validate[this.navigation])) {
      return false;
    }

    if (!(this.hasPreviousStep() || !this.hasNextStep()) && !this.areReceiversSelected()) {
      return true;
    }

    if (!this.hasNextStep() && this.submissionHasErrors()) {
      return true;
    }
    return !!this.displayStepErrors(this.navigation);

  };

  checkForInvalidFields() {
    for (let counter = 0; counter <= this.navigation; counter++) {
      this.validate[counter] = true;
      if (this.questionnaire.steps[counter].enabled) {
        if (this.stepForms.get(counter)?.invalid) {
          this.navigation = counter;
          return false;
        }
      }
    }
    return true;
  }

  completeSubmission() {
    this.receivedData = this.submissionService.getSharedData();
    if (this.receivedData !== null && this.receivedData !== undefined) {
      this.receivedData.upload();
    }
    this.fieldUtilitiesService.onAnswersUpdate(this);

    if (!this.runValidation()) {
      this.utilsService.scrollToTop();
      return;
    }
    this.submission._submission.identity_provided = this.identity_provided;

    this.submission._submission.answers = this.answers;

    this.utilsService.resumeFileUploads(this.uploads);
    this.done = true;

    const intervalId = setInterval(() => {
      if (this.uploads) {
        for (const key in this.uploads) {

          if (this.uploads[key].flowFile && this.uploads[key].flowFile.isUploading()) {
            return;
          }
        }
      }
      if (this.uploading()) {
        return;
      }

      this.submission.submit();
      clearInterval(intervalId); // Clear the interval
    }, 1000);
  }

  runValidation() {
    this.validate[this.navigation] = true;

    return !(!this.areReceiversSelected() || !this.checkForInvalidFields());


  };

  incrementStep() {
    if (!this.runValidation()) {
      return;
    }

    if (this.hasNextStep()) {
      for (let i = this.navigation + 1; i <= this.lastStepIndex(); i++) {
        if (this.fieldUtilitiesService.isFieldTriggered(null, this.questionnaire.steps[i], this.answers, this.score)) {
          this.navigation = i;
          this.utilsService.scrollToTop();
          return;
        }
      }
    }
  }

  resetForm() {
    if (this.submissionForm) {
      this.submissionForm.reset();
    }
  }

  decrementStep() {
    if (this.hasPreviousStep()) {
      for (let i = this.navigation - 1; i >= this.firstStepIndex(); i--) {
        if (i === -1 || this.fieldUtilitiesService.isFieldTriggered(null, this.questionnaire.steps[i], this.answers, this.score)) {
          this.navigation = i;
          this.utilsService.scrollToTop();
          return;
        }
      }
    }
  };

  onFormChange() {
    this.fieldUtilitiesService.onAnswersUpdate(this);
  }

  notifyFileUpload(uploads: any) {
    if (uploads) {
      this.uploads = uploads;
      this.fieldUtilitiesService.onAnswersUpdate(this);
    }
  }
}
