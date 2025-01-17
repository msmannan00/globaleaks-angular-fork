import {Component, EventEmitter, Input, Output, QueryList} from "@angular/core";
import {SubmissionService} from "@app/services/helper/submission.service";
import {FormArray, FormGroup, NgForm} from "@angular/forms";
import {Field} from "@app/models/resolvers/field-template-model";
import {DisplayStepErrorsFunction, StepFormFunction} from "@app/shared/constants/types";

@Component({
  selector: "src-step-error",
  templateUrl: "./step-error.component.html"
})
export class StepErrorComponent {
  @Input() navigation: number;

  @Input() displayStepErrors: DisplayStepErrorsFunction;
  @Input() stepForm: StepFormFunction;
  @Input() submission: SubmissionService;
  @Input() stepForms: QueryList<NgForm>;
  @Input() field_id_map: { [key: string]: Field };
  @Output() goToStep: EventEmitter<any> = new EventEmitter();

  getInnerGroupErrors(form: NgForm): string[] {
    const errors: string[] = [];
    this.processFormGroup(form.form, errors);
    return errors;
  }

  private processFormGroup(formGroup: FormGroup, errors: string[], parentControlName = ""): void {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.controls[controlName];

      if (control instanceof FormGroup) {
        const nestedControlName = parentControlName ? `${parentControlName}.${controlName}` : controlName;
        this.processFormGroup(control, errors, nestedControlName);
      } else if (control instanceof FormArray) {
        control.controls.forEach((nestedControl, index) => {
          const nestedControlName = parentControlName ? `${parentControlName}.${controlName}[${index}]` : `${controlName}[${index}]`;
          this.processFormGroup(nestedControl as FormGroup, errors, nestedControlName);
        });
      } else if (control.errors) {
        errors.push(parentControlName);
      }
    });
  }
}
