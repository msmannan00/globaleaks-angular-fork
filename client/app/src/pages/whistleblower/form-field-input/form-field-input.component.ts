import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FieldUtilitiesService} from "@app/shared/services/field-utilities.service";
import {ControlContainer, NgForm} from "@angular/forms";
import {SubmissionService} from "@app/services/helper/submission.service";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {Answers} from "@app/models/reciever/reciever-tip-data";
import {Step} from "@app/models/whistleblower/wb-tip-data";
import {Field} from "@app/models/resolvers/field-template-model";

@Component({
  selector: "src-form-field-input",
  templateUrl: "./form-field-input.component.html",
  viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class FormFieldInputComponent implements OnInit {

  @Input() field: any;
  @Input() index: number;
  @Input() step: Step;
  @Input() submission: SubmissionService;
  @Input() entryIndex: number;
  @Input() fieldEntry: string;
  @Input() entry: any;
  @Input() fieldId: string;
  @Input() displayErrors: boolean;
  @Input() answers: Answers;
  @Input() fields: Field;
  @Input() uploads: { [key: string]: any };
  @Input() identity_provided: boolean;
  @Input() fileUploadUrl: string;
  @Output() notifyFileUpload: EventEmitter<any> = new EventEmitter<any>();

  entryValue: string = "";
  fieldFormVarName: string;
  input_entryIndex = "";
  input_date: NgbDateStruct;
  input_start_date: NgbDateStruct;
  input_end_date: NgbDateStruct;
  validator: string | RegExp;
  rows: Step;
  dateRange: { start: string, end: string } = {"start": "", "end": ""};
  dateOptions1: NgbDateStruct;
  dateOptions2: NgbDateStruct;
  dateOptions: { min_date: NgbDateStruct, max_date: NgbDateStruct }

  constructor(private fieldUtilitiesService: FieldUtilitiesService) {
  }

  clearDateRange() {
    this.input_start_date = {year: 0, month: 0, day: 0};
    this.input_end_date = {year: 0, month: 0, day: 0};
    this.dateRange = {
      "start": "",
      "end": ""
    };
    this.entry.value = "";
  }

  initializeFormNames() {
    this.input_entryIndex = "input-" + this.entryIndex;
  }

  ngOnInit(): void {
    this.entry["value"] = "";
    this.fieldFormVarName = this.fieldUtilitiesService.fieldFormName(this.field.id + "$" + this.index);
    this.initializeFormNames();
    this.fieldEntry = this.fieldId + "-input-" + this.index;
    this.rows = this.fieldUtilitiesService.splitRows(this.field.children);
    if (this.field.type === "inputbox") {
      const validator_regex = this.fieldUtilitiesService.getValidator(this.field);
      if (validator_regex.length > 0) {
        this.validator = validator_regex;
      }
    }
    if (this.field.type === "date") {
      if (this.field.attrs.min_date) {
        this.dateOptions.min_date = this.field.attrs.min_date.value;
      }
      if (this.field.attrs.max_date) {
        this.dateOptions.max_date = this.field.attrs.max_date.value;
      }
    }
    if (this.field.type === "daterange") {
      if (this.field.attrs.min_date) {
        this.dateOptions1 = this.field.attrs.min_date.value;
      }
      if (this.field.attrs.max_date) {
        this.dateOptions2 = this.field.attrs.max_date.value;
      }
    }
  }

  onDateSelection() {
    this.entry.value = this.convertNgbDateToISOString(this.input_date);
  }

  convertNgbDateToISOString(date: NgbDateStruct): string {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return jsDate.toISOString();
  }

  onStartDateSelection(date: NgbDateStruct): void {
    const startDate = new Date(date.year, date.month - 1, date.day);
    this.dateRange.start = startDate.getTime().toString();
    this.entry.value = `${this.dateRange.start}:${this.dateRange.end}`;
  }

  onEndDateSelection(date: NgbDateStruct): void {
    const endDate = new Date(date.year, date.month - 1, date.day);
    this.dateRange.end = endDate.getTime().toString();
    this.entry.value = `${this.dateRange.start}:${this.dateRange.end}`;
  }

  validateUploadSubmission() {
    return !!(this.uploads && this.uploads[this.field ? this.field.id : "status_page"] !== undefined && (this.field.type === "fileupload" && this.uploads && this.uploads[this.field ? this.field.id : "status_page"] && Object.keys(this.uploads[this.field ? this.field.id : "status_page"]).length === 0));
  }
}
