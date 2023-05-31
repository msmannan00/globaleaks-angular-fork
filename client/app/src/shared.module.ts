import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent} from "./shared/partials/footer/footer.component";
import { ReceiptComponent } from './shared/partials/receipt/receipt.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslatorPipe} from "./shared/pipes/translate";
import { Enable2fa } from './shared/partials/enable-2fa/enable-2fa';
import {TranslateModule} from "@ngx-translate/core";
import {QRCodeModule} from "angularx-qrcode";
import { PasswordChangeComponent } from './shared/partials/password-change/password-change.component';
import { PasswordMeterComponent } from './shared/components/password-meter/password-meter.component';
import {
    NgbPagination,
    NgbPaginationFirst, NgbPaginationLast,
    NgbPaginationNext, NgbPaginationNumber, NgbPaginationPages,
    NgbPaginationPrevious,
    NgbProgressbar,NgbDatepickerModule
} from "@ng-bootstrap/ng-bootstrap";
import { PrivacybadgeComponent } from './shared/partials/privacybadge/privacybadge.component';
import {MarkdownModule} from "ngx-markdown";
import { StripHtmlPipe } from './shared/pipes/strip-html.pipe';
import { ReceiptvalidatorDirective } from './shared/directive/receiptvalidator.directive';
import { TipInfoComponent } from './shared/partials/tip-info/tip-info.component';
import { TipSubmissionStatusComponent } from './shared/partials/tip-submission-status/tip-submission-status.component';
import {NgSelectModule} from "@ng-select/ng-select";
import { TipAdditionalQuestionnaireInviteComponent } from './shared/partials/tip-additional-questionnaire-invite/tip-additional-questionnaire-invite.component';
import { TipFieldComponent } from './shared/partials/tip-field/tip-field.component';
import { TipFieldAnswerEntryComponent } from './shared/partials/tip-field-answer-entry/tip-field-answer-entry.component';
import {
    TipQuestionnaireAnswersComponent
} from "./shared/partials/tip-questionnaire-answers/tip-questionnaire-answers.component";
import { DatePipe } from './shared/pipes/date.pipe';
import { SplitPipe } from './shared/pipes/split.pipe';
import { TipFilesWhistleblowerComponent } from './shared/partials/tip-files-whistleblower/tip-files-whistleblower.component';
import { WidgetWbfilesComponent } from './shared/partials/widget-wbfiles/widget-wbfiles.component';
import { ByteFmtPipe } from './shared/pipes/byte-fmt.pipe';
import { RfileUploadButtonComponent } from './shared/partials/rfile-upload-button/rfile-upload-button.component';
import { RfileUploadStatusComponent } from './shared/partials/rfile-upload-status/rfile-upload-status.component';
import { TipCommentsComponent } from './shared/partials/tip-comments/tip-comments.component';
import { TipMessagesComponent } from './shared/partials/tip-messages/tip-messages.component';
import { TipMessageComponent } from './shared/partials/tip-message/tip-message.component';
import { LimitToPipe } from './shared/pipes/limit-to.pipe';
import { OrderByPipe } from './shared/pipes/order-by.pipe';
import { ScrollToBottomDirective } from './shared/directive/scroll-to-bottom.directive';
import { TipReceiverListComponent } from './shared/partials/tip-receiver-list/tip-receiver-list.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { RequestSupportComponent } from './shared/modals/request-support/request-support.component';
import {WhistleblowerModule} from "./pages/whistleblower/whistleblower.module";
import {
    WhistleblowerIdentityFieldComponent
} from "./pages/field/whistleblower-identity-field/whistleblower-identity-field.component";
import {NgxFlowModule} from "@flowjs/ngx-flow";
import { RfilesUploadStatusComponent } from './shared/partials/rfiles-upload-status/rfiles-upload-status.component';
import { NgFormChangeDirective } from './shared/directive/ng-form-change.directive';
import { WbfilesComponent } from './shared/partials/wbfiles/wbfiles.component';
import { DisableCcpDirective } from './shared/directive/disable-ccp.directive';
import { SubdomainvalidatorDirective } from './shared/directive/subdomainvalidator.directive';
import { PasswordStrengthValidatorDirective } from './shared/directive/password-strength-validator.directive';
import { UserHomeComponent } from './shared/partials/user-home/user-home.component';
import { UserWarningsComponent } from './shared/partials/user-warnings/user-warnings.component';
import { GrantAccessComponent } from './shared/modals/grant-access/grant-access.component';
import { RevokeAccessComponent } from './shared/modals/revoke-access/revoke-access.component';
import { DeleteConfirmationComponent } from './shared/modals/delete-confirmation/delete-confirmation.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        QRCodeModule,
        ReactiveFormsModule,
        NgbProgressbar,
        MarkdownModule,
        NgSelectModule,
        NgbPagination,
        NgbPaginationPrevious,
        NgbPaginationNext,
        NgbPaginationFirst,
        NgbPaginationLast,
        NgbPaginationNumber,
        NgbPaginationPages,
        NgxFlowModule,
        NgbDatepickerModule
    ],
    declarations: [
        FooterComponent,
        ReceiptComponent,
        TranslatorPipe,
        Enable2fa,
        PasswordChangeComponent,
        PasswordMeterComponent,
        PrivacybadgeComponent,
        StripHtmlPipe,
        DatePipe,
        ReceiptvalidatorDirective,
        TipInfoComponent,
        TipQuestionnaireAnswersComponent,
        TipSubmissionStatusComponent,
        TipAdditionalQuestionnaireInviteComponent,
        TipFieldComponent,
        TipFieldAnswerEntryComponent,
        DatePipe,
        SplitPipe,
        TipFilesWhistleblowerComponent,
        WidgetWbfilesComponent,
        ByteFmtPipe,
        RfileUploadButtonComponent,
        RfileUploadStatusComponent,
        TipCommentsComponent,
        TipMessagesComponent,
        TipMessageComponent,
        LimitToPipe,
        OrderByPipe,
        ScrollToBottomDirective,
        TipReceiverListComponent,
        FilterPipe,
        RequestSupportComponent,
        WhistleblowerIdentityFieldComponent,
        RfilesUploadStatusComponent,
        NgFormChangeDirective,
        WbfilesComponent,
        DisableCcpDirective,
        SubdomainvalidatorDirective,
        PasswordStrengthValidatorDirective,
        PasswordStrengthValidatorDirective,
        UserHomeComponent,
        UserWarningsComponent,
        GrantAccessComponent,
        RevokeAccessComponent,
        DeleteConfirmationComponent
    ],
    exports: [
        FooterComponent,
        ReceiptComponent,
        TranslatorPipe,
        PrivacybadgeComponent,
        Enable2fa,
        PasswordChangeComponent,
        StripHtmlPipe,
        FilterPipe,
        OrderByPipe,
        TipInfoComponent,
        TipQuestionnaireAnswersComponent,
        TipAdditionalQuestionnaireInviteComponent,
        TipFieldComponent,
        TipFilesWhistleblowerComponent,
        WidgetWbfilesComponent,
        TipCommentsComponent,
        TipMessagesComponent,
        TipReceiverListComponent,
        RfileUploadStatusComponent,
        RfileUploadButtonComponent,
        RfilesUploadStatusComponent,
        NgFormChangeDirective,
        DisableCcpDirective,
        SubdomainvalidatorDirective,
        PasswordMeterComponent,
        PasswordStrengthValidatorDirective,
        UserHomeComponent,
        UserWarningsComponent,
        GrantAccessComponent,
        RevokeAccessComponent,
        DeleteConfirmationComponent

    ]})
export class SharedModule { }
