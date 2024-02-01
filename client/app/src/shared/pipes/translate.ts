import {Pipe} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Pipe({
  name: "translate",
  pure: false,
})
export class TranslatorPipe {
  constructor(private translate: TranslateService) {
  }

  transform(key: string): string {
    let translation = this.translate.instant(key);

    this.translate.onLangChange.subscribe(() => {
      translation = this.translate.instant(key);
    });

    return translation;
  }
}
