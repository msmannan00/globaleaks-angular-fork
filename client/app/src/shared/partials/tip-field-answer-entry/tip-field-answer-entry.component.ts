import {HttpClient} from "@angular/common/http";
import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AuthenticationService} from "@app/services/helper/authentication.service";
import { ReceiverTipService } from "@app/services/helper/receiver-tip.service";
import {WbtipService} from "@app/services/helper/wbtip.service";

@Component({
  selector: "src-tip-field-answer-entry",
  templateUrl: "./tip-field-answer-entry.component.html"
})
export class TipFieldAnswerEntryComponent implements OnInit {
  @Input() entry: any;
  @Input() field: any;
  @Input() fieldAnswers: any;
  format = "dd/MM/yyyy";
  locale = "en-US";
  audioFiles: { [reference_id: string]: Blob } = {};
  iframeUrl: SafeResourceUrl;
  @ViewChild("viewer") viewerFrame: ElementRef;
  tipService:WbtipService|ReceiverTipService;
  constructor(private http: HttpClient, private sanitizer: DomSanitizer, protected authenticationService: AuthenticationService, private wbTipService: WbtipService,private rTipService: ReceiverTipService) {
  }

  ngOnInit(): void {
    if (this.authenticationService.session.role === "whistleblower") {
      this.tipService = this.wbTipService;
    }
    if(this.authenticationService.session.role === "receiver") {
      this.tipService = this.rTipService;
    }
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl("viewer/index.html");
    this.loadAudioFile(this.field.id);
  }

  loadAudioFile(reference_id: string): void {
     for (const wbfile of this.tipService.tip.wbfiles) {
        if (wbfile.reference_id === reference_id) {
        const id = wbfile.id;
        const url = this.getApiUrl(id);

        this.http.get(url, {
          headers: {
            'x-session': this.authenticationService.session.id
          },
          responseType: 'blob'
        }).subscribe((response: Blob) => {
          this.audioFiles[reference_id] = response;
          window.addEventListener("message", (message: MessageEvent) => {
            const iframe = this.viewerFrame.nativeElement;
            if (message.source !== iframe.contentWindow) {
              return;
            }
            const data = {
              tag: "audio",
              blob: this.audioFiles[reference_id],
            };
            iframe.contentWindow.postMessage(data, "*");
          });
        });

        break;
       }
      }
  }

  private getApiUrl(id: string): string {
    const role = this.authenticationService.session.role;
    return role === 'whistleblower' ?
      `api/whistleblower/wbtip/wbfiles/${id}` :
      `api/recipient/wbfiles/${id}`;
  }

}
