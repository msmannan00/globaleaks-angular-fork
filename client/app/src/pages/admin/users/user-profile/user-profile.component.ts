import {Component, OnInit, inject} from "@angular/core";
import {NewUser} from "@app/models/admin/new-user";
import {tenantResolverModel} from "@app/models/resolvers/tenant-resolver-model";
import {userResolverModel} from "@app/models/resolvers/user-resolver-model";
import {Constants} from "@app/shared/constants/constants";
import {NodeResolver} from "@app/shared/resolvers/node.resolver";
import {TenantsResolver} from "@app/shared/resolvers/tenants.resolver";
import {UsersResolver} from "@app/shared/resolvers/users.resolver";
import {HttpService} from "@app/shared/services/http.service";
import {UtilsService} from "@app/shared/services/utils.service";
import {NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {UserEditorComponent} from "../user-editor/user-editor.component";
import {TranslatorPipe} from "@app/shared/pipes/translate";
import {OrderByPipe} from "@app/shared/pipes/order-by.pipe";

@Component({
  selector: 'src-user-profile',
  standalone: true,
  imports: [FormsModule, NgbTooltipModule, NgClass, UserEditorComponent, TranslatorPipe, OrderByPipe],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  private httpService = inject(HttpService);
  protected nodeResolver = inject(NodeResolver);
  private usersResolver = inject(UsersResolver);
  private tenantsResolver = inject(TenantsResolver);
  private utilsService = inject(UtilsService);

  showAddUser = false;
  tenantData: tenantResolverModel;
  usersData: userResolverModel[];
  new_user: { username: string, role: string, name: string, email: string } = {
    username: "",
    role: "",
    name: "",
    email: ""
  };
  editing = false;
  protected readonly Constants = Constants;

  ngOnInit(): void {
    if (this.usersResolver.dataModel) {
      this.usersData = this.usersResolver.dataModel.filter(user => user.id == user.profile_id);
    }
    if (this.nodeResolver.dataModel.root_tenant) {
      this.tenantData = this.tenantsResolver.dataModel;
    }
  }

  addUser(): void {
    const user: NewUser = new NewUser();

    user.username = typeof this.new_user.username !== "undefined" ? this.new_user.username : "";
    user.role = this.new_user.role;
    user.name = this.new_user.name;
    user.mail_address = this.new_user.name +"@g.co";
    user.language = this.nodeResolver.dataModel.default_language;
    this.utilsService.addAdminUser(user).subscribe(_ => {
      this.getResolver();
      this.new_user = {username: "", role: "", name: "", email: ""};
    });
  }

  getResolver() {
    return this.httpService.requestUsersResource().subscribe(response => {
      this.usersResolver.dataModel = response;
      this.usersData = response.filter(user => user.id == user.profile_id);

    });
  }

  toggleAddUser(): void {
    this.showAddUser = !this.showAddUser;
  }
}

