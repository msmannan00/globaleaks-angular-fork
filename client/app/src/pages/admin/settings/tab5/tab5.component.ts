import {Component, Input} from "@angular/core";
import {NgForm} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Constants} from "app/src/shared/constants/constants";
import {EnableEncryptionComponent} from "app/src/shared/modals/enable-encryption/enable-encryption.component";
import {NodeResolver} from "app/src/shared/resolvers/node.resolver";
import {PreferenceResolver} from "app/src/shared/resolvers/preference.resolver";
import {QuestionnairesResolver} from "app/src/shared/resolvers/questionnaires.resolver";
import {UsersResolver} from "app/src/shared/resolvers/users.resolver";
import {UtilsService} from "app/src/shared/services/utils.service";
import {AppConfigService} from "@app/services/app-config.service";
import {AuthenticationService} from "app/src/services/authentication.service";

@Component({
  selector: "src-tab5",
  templateUrl: "./tab5.component.html"
})
export class Tab5Component {
  @Input() contentForm: NgForm;
  userData: any = {};
  questionnaireData: any = {};

  constructor(private authenticationService: AuthenticationService, private modalService: NgbModal, private appConfigService: AppConfigService, private utilsService: UtilsService, public nodeResolver: NodeResolver, public preferenceResolver: PreferenceResolver, private usersResolver: UsersResolver, private questionnairesResolver: QuestionnairesResolver) {

  }

  protected readonly Constants = Constants;

  ngOnInit(): void {
    this.userData = this.usersResolver.dataModel;
    this.userData = this.userData.filter((user: { escrow: boolean; }) => user.escrow);
    this.questionnaireData = this.questionnairesResolver.dataModel;

  }

  enableEncryption() {
    const node = this.nodeResolver.dataModel;
    node.encryption = false;

    if (!node.encryption) {
      const modalRef = this.modalService.open(EnableEncryptionComponent, {});
      modalRef.result.then(
        () => {
          this.utilsService.runAdminOperation("enable_encryption", {}, false).subscribe(
            () => {
              this.authenticationService.logout();
            },
            () => {
            }
          );
        },
        () => {
        }
      );
    }
  }

  toggleEscrow() {
    this.nodeResolver.dataModel.escrow = !this.nodeResolver.dataModel.escrow;
    this.utilsService.runAdminOperation("toggle_escrow", {}, true).subscribe(
      () => {
        this.preferenceResolver.dataModel.escrow = !this.preferenceResolver.dataModel.escrow;
      },
      () => {
      }
    );
  }

  updateNode() {
    this.utilsService.update(this.nodeResolver.dataModel).subscribe(_ => {
      this.appConfigService.reinit();
      this.utilsService.reloadCurrentRoute();
    });
  }

  resetSubmissions() {
    this.utilsService.deleteDialog();
  }
}