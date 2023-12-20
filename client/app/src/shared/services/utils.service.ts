import {EventEmitter, Inject, Injectable, Renderer2} from "@angular/core";
import {AuthenticationService} from "@app/services/authentication.service";
import {AppDataService} from "@app/app-data.service";
import * as Flow from "@flowjs/flow.js";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RequestSupportComponent} from "@app/shared/modals/request-support/request-support.component";
import {HttpService} from "@app/shared/services/http.service";
import {TokenResource} from "@app/shared/services/token-resource.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, map} from "rxjs";
import {ConfirmationWithPasswordComponent} from "@app/shared/modals/confirmation-with-password/confirmation-with-password.component";
import {ConfirmationWith2faComponent} from "@app/shared/modals/confirmation-with2fa/confirmation-with2fa.component";
import {PreferenceResolver} from "@app/shared/resolvers/preference.resolver";
import {DeleteConfirmationComponent} from "@app/shared/modals/delete-confirmation/delete-confirmation.component";
import {NodeResolver} from "@app/shared/resolvers/node.resolver";
import {ServiceInstanceService} from "@app/shared/services/service-instance.service";
import {ClipboardService} from "ngx-clipboard";
import {AppConfigService} from "@app/services/app-config.service";
import {DOCUMENT} from "@angular/common";
import { TlsConfig } from "@app/models/component-model/tls-confiq";
import { nodeResolverModel } from "@app/models/resolvers/node-resolver-model";
import { NewUser } from "@app/models/admin/new-user";
import { userResolverModel } from "@app/models/resolvers/user-resolver-model";
import { NewContext } from "@app/models/admin/new-context";
import { contextResolverModel } from "@app/models/resolvers/context-resolver-model";
import { notificationResolverModel } from "@app/models/resolvers/notification-resolver-model";
import { questionnaireResolverModel } from "@app/models/resolvers/questionnaire-model";
import { Field } from "@app/models/resolvers/field-template-model";
import { rtipResolverModel } from "@app/models/resolvers/rtips-resolver-model";
import { Option } from "@app/models/whistleblower/wb-tip-data";
import { Status } from "@app/models/app/public-model";

@Injectable({
  providedIn: "root"
})
export class UtilsService {

  public authenticationService: AuthenticationService;

  constructor(private appConfigService: AppConfigService, private clipboardService: ClipboardService, private serviceInstanceService: ServiceInstanceService, private nodeResolver: NodeResolver, private http: HttpClient, private httpService: HttpService, private modalService: NgbModal, private translateService: TranslateService, private appDataService: AppDataService, private preferenceResolver: PreferenceResolver, private tokenResourceService: TokenResource, private router: Router) {
  }

  init() {
    this.authenticationService = this.serviceInstanceService.authenticationService;
  }

  updateNode() {
    this.httpService.updateNodeResource(this.nodeResolver.dataModel).subscribe();
  }

  str2Uint8Array(str: string) {
    const result = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  }

  newItemOrder(objects: any[], key: string): number {
    if (objects.length === 0) {
      return 0;
    }

    let max = 0;
    objects.forEach(object => {
      if (object[key] > max) {
        max = object[key];
      }
    });

    return max + 1;
  }

  rolel10n(role: string) {
    let ret = "";

    if (role) {
      ret = role === "receiver" ? "recipient" : role;
      ret = ret.charAt(0).toUpperCase() + ret.slice(1);
    }

    return ret;
  }

  async load(url: string): Promise<string> {
    const token = await this.tokenResourceService.getWithProofOfWork();
    return url + "?token=" + token.id + ":" + token.answer;
  }

  download(url: string): void {
    this.tokenResourceService.getWithProofOfWork().then((token: any) => {
      window.open(`${url}?token=${token.id}:${token.answer}`);
    });
  }

  isUploading(uploads?: any) {
    if (uploads) {
      for (const key in uploads) {
        if (uploads[key].flowFile && uploads[key].flowFile.isUploading()) {
          return true;
        }
      }
    }
    return false;
  }

  removeBootstrap(renderer: Renderer2, document:Document, link:string){
    let defaultBootstrapLink = document.head.querySelector(`link[href="${link}"]`);
    if (defaultBootstrapLink) {
      renderer.removeChild(document.head, defaultBootstrapLink);
    }
  }


  resumeFileUploads(uploads: any) {
    if (uploads) {
      for (const key in uploads) {
        if (uploads[key] && uploads[key].flowJs) {
          uploads[key].flowJs.upload();
        }
      }
    }
  }

  getDirection(language: string): string {
    const rtlLanguages = ['ar', 'dv', 'fa', 'fa_AF', 'he', 'ps', 'ug', 'ur'];
    return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  }

  view(url: string, _: string, callback: (blob: Blob) => void): void {
    const headers = new HttpHeaders({
      "x-session": this.authenticationService.session.id
    });

    this.http.get(url, {
      headers: headers,
      responseType: "blob"
    }).subscribe(
      (response: Blob) => {
        callback(response);
      }
    );
  }

  getCardSize(num: number) {
    if (num < 2) {
      return "col-md-12";
    } else if (num === 2) {
      return "col-md-6";
    } else if (num === 3) {
      return "col-md-4";
    } else {
      return "col-md-3 col-sm-6";
    }
  }

  scrollToTop() {
    document.documentElement.scrollTop = 0;
  }

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl("blank", {skipLocationChange: true, replaceUrl: true}).then(() => {
      this.router.navigate([currentUrl]).then();
    });
  }

  reloadComponent() {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    let currentUrl = this.router.url + "?";

    this.router.navigateByUrl(currentUrl)
      .then(() => {
        this.router.navigated = false;
        this.router.navigate([this.router.url]).then();
      });
  }
  onFlowUpload(flowJsInstance:Flow, file:File){
    const fileNameParts = file.name.split(".");
    const fileExtension = fileNameParts.pop();
    const fileNameWithoutExtension = fileNameParts.join(".");
    const timestamp = new Date().getTime();
    const fileNameWithTimestamp = `${fileNameWithoutExtension}_${timestamp}.${fileExtension}`;
    const modifiedFile = new File([file], fileNameWithTimestamp, {type: file.type});

    flowJsInstance.addFile(modifiedFile);
    flowJsInstance.upload();
  }

  swap($event: Event, index: number, n: number, questionnaire:questionnaireResolverModel): void {
    $event.stopPropagation();

    const target = index + n;
    if (target < 0 || target >= questionnaire.steps.length) {
      return;
    }

    [questionnaire.steps[index], questionnaire.steps[target]] =
      [questionnaire.steps[target], questionnaire.steps[index]];

    this.http.put("api/admin/steps", {
      operation: "order_elements",
      args: {
        ids: questionnaire.steps.map((c: { id: string; }) => c.id),
        questionnaire_id: questionnaire.id
      },
    }).subscribe();
  }

  toggleCfg(tlsConfig:TlsConfig, dataToParent:EventEmitter<string>) {
    if (tlsConfig.enabled) {
      const authHeader = this.authenticationService.getHeader();
      this.httpService.disableTLSConfig(tlsConfig, authHeader).subscribe(() => {
        dataToParent.emit();
      });
    } else {
      const authHeader = this.authenticationService.getHeader();
      this.httpService.enableTLSConfig(tlsConfig, authHeader).subscribe(() => {
        window.location.href = "https://" + window.location.hostname + "/#/login";
      });
    }
  }

  reloadCurrentRouteFresh(removeQueryParam = false) {

    let currentUrl = this.router.url;
    if (removeQueryParam) {
      currentUrl = this.router.url.split("?")[0];
    }

    this.router.navigateByUrl("/blank", {skipLocationChange: true}).then(() => {
      this.router.navigateByUrl(currentUrl, {replaceUrl: true}).then();
    });
  }

  showWBLoginBox() {
    return this.router.url === "/submission";
  }

  showUserStatusBox() {
    return this.appDataService.public.node.wizard_done &&
      this.appDataService.page !== "homepage" &&
      this.appDataService.page !== "submissionpage" &&
      this.authenticationService.session;
  }

  isWhistleblowerPage() {
    const currentUrl = this.router.url;
    return this.appDataService.public.node.wizard_done && (!this.authenticationService.session || (location.hash==='#/' || location.hash.startsWith('#/submission'))) && ((currentUrl === '/' && !this.appDataService.public.node.enable_signup) || currentUrl === '/submission' || currentUrl === '/blank');
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  encodeString(string: string): string {
    const codeUnits = Uint16Array.from(
      {length: string.length},
      (_, index) => string.charCodeAt(index)
    );

    const charCodes = new Uint8Array(codeUnits.buffer);

    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });

    return btoa(result);
  }

  openSupportModal() {
    if (this.appDataService.public.node.custom_support_url) {
      window.open(this.appDataService.public.node.custom_support_url, "_blank");
    } else {
      this.modalService.open(RequestSupportComponent,{backdrop: 'static',keyboard: false});
    }
  }

  routeCheck() {
    const path = location.pathname;
    if (path !== "/") {
      this.appConfigService.setPage("");
    }

    if (!this.appDataService.public) {
      return;
    }

    if (path === "/" && this.appDataService.public.node.enable_signup) {
      this.appConfigService.setPage("signuppage");
    } else if ((path === "/" || path === "/submission") && this.appDataService.public.node.adminonly && !this.authenticationService.session) {
      location.replace("/admin");
    }
  }

  array_to_map(receivers: any) {
    const ret: any = {};

    receivers.forEach(function (element: any) {
      ret[element.id] = element;
    });

    return ret;
  }

  copyToClipboard(data: string) {
    this.clipboardService.copyFromContent(data);
  }

  openNewTab(){
    window.open('https://'+ window.location.hostname, '_blank');
  }

  getSubmissionStatusText(status: string,substatus:string, submission_statuses: Status[]) {
    let text;
    for (let i = 0; i < submission_statuses.length; i++) {
      if (submission_statuses[i].id === status) {
        text = submission_statuses[i].label;


        const subStatus = submission_statuses[i].substatuses;
        for (let j = 0; j < subStatus.length; j++) {
          if (subStatus[j].id === substatus) {
            text += "(" + subStatus[j].label + ")";
            break;
          }
        }
        break;
      }
    }
    return text?text:"";
  }

  isNever(time: string) {
    const date = new Date(time);
    return date.getTime() === 32503680000000;
  }

  deleteFromList(list:  { [key: string]: Field}[], elem: { [key: string]: Field}) {
    const idx = list.indexOf(elem);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  }

  showFilePreview(content_type: string) {
    const content_types = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/bmp"
    ];

    return content_types.indexOf(content_type) > -1;
  }

  submitSupportRequest(arg: {mail_address: string,text: string} ) {
    const param = JSON.stringify({
      "mail_address": arg.mail_address,
      "text": arg.text,
      "url": window.location.href.replace("localhost", "127.0.0.1")
    });
    this.httpService.requestSuppor(param).subscribe();
  }

  runUserOperation(operation: string, args: any, refresh: boolean) {
    return this.httpService.runOperation("api/user/operations", operation, args, refresh);
  }

  runRecipientOperation(operation: string, args: {rtips:string[], receiver?: {id: number}}, refresh: boolean) {
    return this.httpService.runOperation("api/recipient/operations", operation, args, refresh);
  }

  go(path: string): void {
    this.router.navigateByUrl(path).then();
  }

  maskScore(score: number) {
    if (score === 1) {
      return this.translateService.instant("Low");
    } else if (score === 2) {
      return this.translateService.instant("Medium");
    } else if (score === 3) {
      return this.translateService.instant("High");
    } else {
      return this.translateService.instant("None");
    }
  }

  getStaticFilter(data: any[], model:{id: number;label: string;}[], key: string): any[] {
    if (model.length === 0) {
      return data;
    } else {
      const rows: any[] = [];
      data.forEach(data_row => {
        model.forEach(selected_option => {
          if (key === "score") {
            const scoreLabel = this.maskScore(data_row[key]);
            if (scoreLabel === selected_option.label) {
              rows.push(data_row);
            }
          } else if (key === "status") {
            if (data_row[key] === selected_option.label) {
              rows.push(data_row);
            }
          } else {
            if (data_row[key] === selected_option.label) {
              rows.push(data_row);
            }
          }
        });
      });
      return rows;
    }
  }

  getDateFilter(Tips: rtipResolverModel[], report_date_filter:[number, number] | null, update_date_filter: [number, number] | null, expiry_date_filter: [number, number] | null): rtipResolverModel[] {
    const filteredTips: rtipResolverModel[] = [];
    Tips.forEach(rows => {
      const m_row_rdate = new Date(rows.last_access).getTime();
      const m_row_udate = new Date(rows.update_date).getTime();
      const m_row_edate = new Date(rows.expiration_date).getTime();

      if (
        (report_date_filter === null || (report_date_filter[0] === 0 || (m_row_rdate > report_date_filter[0] && m_row_rdate < report_date_filter[1]))) &&
        (update_date_filter === null || (update_date_filter[0] === 0 || (m_row_udate > update_date_filter[0] && m_row_udate < update_date_filter[1]))) &&
        (expiry_date_filter === null || (expiry_date_filter[0] === 0 || (m_row_edate > expiry_date_filter[0] && m_row_edate < expiry_date_filter[1])))
      ) {
        filteredTips.push(rows);
      }
    });

    return filteredTips;
  }

  print() {
    window.print();
  }

  saveAs(filename: any, url: string): void {

    const headers = new HttpHeaders({
      "X-Session": this.authenticationService.session.id
    });

    this.http.get(url, {responseType: "blob", headers: headers}).subscribe(
      response => {
        const blob = new Blob([response], {type: "application/octet-stream"});
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
    );
  }

  getPostponeDate(ttl: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + ttl + 1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  update(node: nodeResolverModel) {
    return this.httpService.requestUpdateAdminNodeResource(node);
  }

  AdminL10NResource(lang: string) {
    return this.httpService.requestAdminL10NResource(lang);
  }

  updateAdminL10NResource(data: {[key: string]: string}, lang: string) {
    return this.httpService.requestUpdateAdminL10NResource(data, lang);
  }

  DefaultL10NResource(lang: string) {
    return this.httpService.requestDefaultL10NResource(lang);
  }

  runAdminOperation(operation: string, args: {value: string}|{}, refresh: boolean) {
    return this.runOperation("api/admin/config", operation, args, refresh);
  }

  deleteDialog() {
    return this.openConfirmableModalDialogReport("", "").subscribe();
  }


  runOperation(api: string, operation: string, args?: {value: string}|{}, refresh?: boolean): Observable<any> {
    const requireConfirmation = [
      "enable_encryption",
      "disable_2fa",
      "get_recovery_key",
      "toggle_escrow",
      "toggle_user_escrow",
      "enable_user_permission_file_upload",
      "reset_submissions"
    ];

    if (!args) {
      args = {};
    }

    if (!refresh) {
      refresh = false;
    }

    if (requireConfirmation.indexOf(operation) !== -1) {
      return new Observable((observer) => {
        this.getConfirmation().subscribe((secret: string) => {
          const headers = new HttpHeaders({"X-Confirmation": this.encodeString(secret)});

          this.http.put(api, {"operation": operation, "args": args}, {headers}).subscribe(  {
              next: (response) => {
                if (refresh) {
                  this.reloadComponent();
                }
                observer.next(response)
              },
              error: (error) => {
                observer.error(error);
              }
            }
          )
        });
      });
    } else {
      return this.http.put(api, {"operation": operation, "args": args}).pipe(
        map((response) => {
          if (refresh) {
            this.reloadComponent();
          }
          return response;
        })
      );
    }
  }

  getConfirmation(): Observable<string> {
    return new Observable((observer) => {
      let modalRef = this.modalService.open(ConfirmationWithPasswordComponent,{backdrop: 'static',keyboard: false});
      if (this.preferenceResolver.dataModel.two_factor) {
        modalRef = this.modalService.open(ConfirmationWith2faComponent,{backdrop: 'static',keyboard: false});
      }

      modalRef.componentInstance.confirmFunction = (secret: string) => {
        observer.next(secret);
        observer.complete();
      };
    });
  }

  openConfirmableModalDialogReport(arg: string, scope: any): Observable<string> {
    scope = !scope ? this : scope;
    return new Observable((observer) => {
      let modalRef = this.modalService.open(DeleteConfirmationComponent,{backdrop: 'static',keyboard: false});
      modalRef.componentInstance.arg = arg;
      modalRef.componentInstance.scope = scope;
      modalRef.componentInstance.confirmFunction = () => {
        observer.complete()
        this.openPasswordConfirmableDialog(arg, scope);
      };
    });
  }

  openPasswordConfirmableDialog(arg: string, scope: any){
    return this.runAdminOperation("reset_submissions", {}, true).subscribe({
      next: (_) => {
      },
      error: (_) => {
        this.openPasswordConfirmableDialog(arg, scope)
      }
    });
  }

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>("api/admin/files");
  }

  deleteFile(url: string): Observable<void> {
    return this.http.delete<void>(url);
  }

  deleteAdminUser(user_id: string) {
    return this.httpService.requestDeleteAdminUser(user_id);
  }

  deleteAdminContext(user_id: string) {
    return this.httpService.requestDeleteAdminContext(user_id);
  }

  deleteStatus(url: string) {
    return this.httpService.requestDeleteStatus(url);
  }

  deleteSubStatus(url: string) {
    return this.httpService.requestDeleteStatus(url);
  }

  addAdminUser(user: NewUser) {
    return this.httpService.requestAddAdminUser(user);
  }

  updateAdminUser(id: string, user: userResolverModel) {
    return this.httpService.requestUpdateAdminUser(id, user);
  }

  addAdminContext(context: NewContext) {
    return this.httpService.requestAddAdminContext(context);
  }

  updateAdminContext(context: contextResolverModel, id: string) {
    return this.httpService.requestUpdateAdminContext(context, id);
  }

  updateAdminNotification(notification: notificationResolverModel) {
    return this.httpService.requestUpdateAdminNotification(notification);
  }

  readFileAsText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Event target is null."));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  moveUp(elem: any): void {
    elem[this.getYOrderProperty(elem)] -= 1;
  }

  moveDown(elem: any): void {
    elem[this.getYOrderProperty(elem)] += 1;
  }

  moveLeft(elem: any): void {
    elem[this.getXOrderProperty(elem)] -= 1;
  }

  moveRight(elem: any): void {
    elem[this.getXOrderProperty(elem)] += 1;
  }

  getXOrderProperty(_: Option[]): string {
    return "x";
  }

  getYOrderProperty(elem: Option): keyof Option {
    return ("order" in elem ? "order" : "y") as keyof Option;
  }

  assignUniqueOrderIndex(elements: Option[]): void {
    if (elements.length <= 0) {
        return;
    }

    const key: keyof Option = this.getYOrderProperty(elements[0]) as keyof Option;
    if (elements.length) {
        let i = 0;
        elements = elements.sort((a, b) => (a[key] as number) - (b[key] as number));
        elements.forEach((element) => {
            (element[key] as number) = i;
            i += 1;
        });
    }
  }

  deleteResource( list: any[], res: any): void {
      list.splice(list.indexOf(res), 1);
  }
  
}
