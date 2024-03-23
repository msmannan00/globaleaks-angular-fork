import {Injectable} from "@angular/core";
import {HttpService} from "@app/shared/services/http.service";
import {UtilsService} from "@app/shared/services/utils.service";
import {AppDataService} from "@app/app-data.service";
import {FieldUtilitiesService} from "@app/shared/services/field-utilities.service";
import {TranslationService} from "@app/services/helper/translation.service";
import {Router, NavigationEnd, ActivatedRoute} from "@angular/router";
import {AuthenticationService} from "@app/services/helper/authentication.service";
import {LanguagesSupported} from "@app/models/app/public-model";
import {TitleService} from "@app/shared/services/title.service";

@Injectable({
  providedIn: "root"
})
export class AppConfigService {
  public sidebar: string = "";

  constructor(private titleService: TitleService, public authenticationService: AuthenticationService, private translationService: TranslationService, private utilsService: UtilsService, private router: Router, private activatedRoute: ActivatedRoute, private httpService: HttpService, private appDataService: AppDataService, private fieldUtilitiesService: FieldUtilitiesService) {
    this.init();
  }

  init() {
    this.activatedRoute.paramMap.subscribe(_ => {
      const currentURL = window.location.hash.substring(2).split("?")[0];
      this.initRoutes(currentURL);
      this.localInitialization();
    });
  }

  initRoutes(currentURL: string) {
    if (this.authenticationService && this.authenticationService.session && currentURL !== "login") {
      const queryParams = this.activatedRoute.snapshot.queryParams;
      const param = localStorage.getItem("default_language");
      if (param) {
        queryParams["lang"] = param;
      }

      if (this.authenticationService.session.role === "admin") {
        this.router.navigate(["/admin"], {queryParams}).then();
      } else if (this.authenticationService.session.role === "receiver") {
        this.router.navigate(["/recipient"], {queryParams}).then();
      } else if (this.authenticationService.session.role === "custodian") {
        this.router.navigate(["/custodian"], {queryParams}).then();
      }
    } else {
      localStorage.removeItem("default_language");
    }
  }

  public setHomepage() {
    location.replace("/");
  };

  public setPage(page: string) {
    this.appDataService.page = page;
    this.titleService.setTitle();
  };

  public loadCustomFiles() {
    let cssLoaded = false;
    let jsLoaded = false;

    // Function to show the body if both CSS and JS are loaded
    const showBodyIfReady = () => {
      if (cssLoaded && jsLoaded) {
        document.body.style.display = 'block';
      }
    };

    if (this.appDataService.public.node.css) {
      const newElem = document.createElement("link");
      newElem.setAttribute("id", "load-custom-css-new");
      newElem.setAttribute("rel", "stylesheet");
      newElem.setAttribute("type", "text/css");
      newElem.setAttribute("href", "s/css");
      document.getElementsByTagName("head")[0].appendChild(newElem);

      newElem.onload = () => {
        const oldElem = document.getElementById("load-custom-css");
        if (oldElem !== null && oldElem.parentNode !== null) {
          oldElem.parentNode.removeChild(oldElem);
        }
        newElem.setAttribute("id", "load-custom-css");
        cssLoaded = true;
        showBodyIfReady();
      };
    } else {
      cssLoaded = true;
    }

    if (this.appDataService.public.node.script) {
      const scriptElem = document.createElement("script");
      scriptElem.setAttribute("id", "load-custom-script");
      scriptElem.setAttribute("src", "s/script");
      document.getElementsByTagName("body")[0].appendChild(scriptElem);

      scriptElem.onload = () => {
        jsLoaded = true;
        showBodyIfReady();
      };
    } else {
      jsLoaded = true;
    }

    if (this.appDataService.public.node.favicon) {
      const faviconElem = window.document.getElementById("favicon");
      if (faviconElem !== null) {
        faviconElem.setAttribute("href", "s/favicon");
      }
    }
  }


  public localInitialization(languageInit = true, callback?: () => void) {
    this.httpService.getPublicResource().subscribe({
      next: data => {
        if (data.body !== null) {
          this.appDataService.public = data.body;
        }
        this.loadCustomFiles();
        this.appDataService.contexts_by_id = this.utilsService.array_to_map(this.appDataService.public.contexts);
        this.appDataService.receivers_by_id = this.utilsService.array_to_map(this.appDataService.public.receivers);
        this.appDataService.questionnaires_by_id = this.utilsService.array_to_map(this.appDataService.public.questionnaires);
        this.appDataService.submissionStatuses = this.appDataService.public.submission_statuses;
        this.appDataService.submission_statuses_by_id = this.utilsService.array_to_map(this.appDataService.public.submission_statuses);

        for (const [key] of Object.entries(this.appDataService.questionnaires_by_id)) {
          this.fieldUtilitiesService.parseQuestionnaire(this.appDataService.questionnaires_by_id[key], {
            fields: [],
            fields_by_id: {},
            options_by_id: {}
          });
          this.appDataService.questionnaires_by_id[key].steps = this.appDataService.questionnaires_by_id[key].steps.sort((a: {
            order: number;
          }, b: { order: number; }) => a.order > b.order);
        }

        for (const [key] of Object.entries(this.appDataService.contexts_by_id)) {
          this.appDataService.contexts_by_id[key].questionnaire = this.appDataService.questionnaires_by_id[this.appDataService.contexts_by_id[key].questionnaire_id];
          if (this.appDataService.contexts_by_id[key].additional_questionnaire_id) {
            this.appDataService.contexts_by_id[key].additional_questionnaire = this.appDataService.questionnaires_by_id[this.appDataService.contexts_by_id[key].additional_questionnaire_id];
          }
        }

        this.appDataService.connection = {
          "tor": data.headers.get("X-Check-Tor") === "true" || location.host.match(/\.onion$/),
        };

        this.appDataService.privacy_badge_open = !this.appDataService.connection.tor;
        this.appDataService.languages_enabled = new Map<string, LanguagesSupported>();
        this.appDataService.languages_enabled_selector = [];
        this.appDataService.languages_supported = new Map<string, LanguagesSupported>();

        this.appDataService.public.node.languages_supported.forEach((lang: LanguagesSupported)=> {
          this.appDataService.languages_supported.set(lang.code, lang);

          if (this.appDataService.public.node.languages_enabled.includes(lang.code)) {
            this.appDataService.languages_enabled.set(lang.code, lang);
            this.appDataService.languages_enabled_selector.push(lang);
          }
        });

        let storageLanguage = localStorage.getItem("default_language");
        const queryParams = this.activatedRoute.snapshot.queryParams;
        if (languageInit) {
          if (!storageLanguage) {
            storageLanguage = this.appDataService.public.node.default_language;
            localStorage.setItem("default_language", storageLanguage);
          }
          if(!queryParams["lang"]){
            const setTitle = () => {
              this.titleService.setTitle();
            };
            this.translationService.onChange(storageLanguage, setTitle);
          }else {
            this.translationService.onChange(storageLanguage);
          }
        }


        this.titleService.setTitle();
        this.onValidateInitialConfiguration();
        if (callback) {
          callback();
        }
      }
    });
  }

  onValidateInitialConfiguration() {
    if (this.appDataService.public.node) {
      if (!this.appDataService.public.node.wizard_done) {
        location.replace("/#/wizard");
      } else if ((this.router.url === "/" || this.router.url === "/submission") && this.appDataService.public.node.adminonly && !this.authenticationService.session) {
        location.replace("/#/admin/home");
      } else if (this.router.url === "/" && this.appDataService.public.node.enable_signup && !location.href.endsWith("admin/home")) {
        location.replace("/#/signup");
      } else if (this.router.url === "/signup" && !this.appDataService.public.node.enable_signup) {
        location.replace("/#/");
      } else if (this.appDataService.page === "blank") {
        this.appDataService.page = "homepage"
      }
    }
  }

  loadAdminRoute(newPath: string) {
    this.appDataService.public.node.wizard_done = true;
    this.appDataService.public.node.languages_enabled = [];
    this.appDataService.public.node.name = "Globaleaks";

    this.router.navigateByUrl(newPath).then(() => {
      this.sidebar = "admin-sidebar";
      this.titleService.setTitle();
    });
  }

  routeChangeListener() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadCustomFiles();
        this.onValidateInitialConfiguration();
        const lastChildRoute = this.findLastChildRoute(this.router.routerState.root);
        if (lastChildRoute && lastChildRoute.snapshot.data && lastChildRoute.snapshot.data["pageTitle"]) {
          this.appDataService.header_title = lastChildRoute.snapshot.data["pageTitle"];
          this.sidebar = lastChildRoute.snapshot.data["sidebar"];
          this.titleService.setTitle();
        } else {
          this.appDataService.header_title = "";
          this.sidebar = "";
          this.titleService.setTitle();
        }
      }
    });
  }

  findLastChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  reinit(languageInit = true) {
    this.localInitialization(languageInit);
  }
}
