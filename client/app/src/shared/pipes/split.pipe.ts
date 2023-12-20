import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: "split"
})
export class SplitPipe implements PipeTransform {
  transform(val: string, params:[string, number]): string {
    return val.split(params[0])[params[1]];
  }
}
