import {Component, Input} from "@angular/core";
import {NgForm} from "@angular/forms";
import {NodeResolver} from "@app/shared/resolvers/node.resolver";
import {UtilsService} from "@app/shared/services/utils.service";
import {AuthenticationService} from "@app/services/authentication.service";

@Component({
  selector: "src-tab1",
  templateUrl: "./tab1.component.html"
})
export class Tab1Component {
  @Input() contentForm: NgForm;
  xc=0
  xv1=0
  xb2=0
  xb7='superman'

    constructor(protected nodeResolver: NodeResolver,
                private utilsService: UtilsService, protected authenticationService: AuthenticationService) {
  }

        updateNode() {
    this.utilsService.update(this.nodeResolver.dataModel).subscribe(_ => {
      this.utilsService.reloadCurrentRoute();
    });
  }
}
