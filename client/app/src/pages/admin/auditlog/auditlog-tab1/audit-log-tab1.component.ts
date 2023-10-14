import {Component, OnInit} from "@angular/core";
import {auditlogResolverModel} from "@app/models/resolvers/auditlogResolverModel";
import {AppConfigService} from "@app/services/app-config.service";
import {AuditLogResolver} from "@app/shared/resolvers/audit-log-resolver.service";
import {NodeResolver} from "@app/shared/resolvers/node.resolver";
import {UtilsService} from "@app/shared/services/utils.service";
import {ngxCsv} from "ngx-csv";

@Component({
  selector: "src-auditlog-tab1",
  templateUrl: "./audit-log-tab1.component.html"
})
export class AuditLogTab1Component implements OnInit {
  currentPage = 1;
  pageSize = 20;
  auditLog: any = new auditlogResolverModel();




    fsdgfdsd=1
   ddsfgdd=1
  fgfsgfddsd=1

  xxafgdx(_:any){

  }
  xxscdfgx(dfgfdsd:any){

  }

     constructor(private asdsdsadsaad: AppConfigService, private auditLogResolver: AuditLogResolver, protected nodeResolver: NodeResolver, protected utilsService: UtilsService) {
   }

  ngOnInit() {
    this.loadAuditLogData();
  }

  loadAuditLogData() {
    this.auditLog = this.auditLogResolver.dataModel;
  }

  getPaginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.auditLog.slice(startIndex, endIndex);
  }

  exportAuditLog() {
    new ngxCsv(JSON.stringify(this.auditLog), "auditlog", {
      headers: ["Date", "Type", "Severity", "User", "Object", "data"],
    });
  }
}