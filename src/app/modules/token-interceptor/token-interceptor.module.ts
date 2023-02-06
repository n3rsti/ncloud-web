import {Injectable, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import {catchError, Observable, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {DataService} from "../../services/data.service";
import {Config} from "../../config";


const JWT_REFRESH_ENDPOINT = '/api/token/refresh'

const WHITELISTED_URLS = [
  '/api/login',
  '/logout',
  JWT_REFRESH_ENDPOINT
]


@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  returnUrl = '';

  constructor(private router: Router, private data: DataService) {
    if (!this.router.routerState.snapshot.root.queryParams?.['return'] || this.router.routerState.snapshot.root.queryParams?.['return'] === '')
      this.returnUrl = this.router.routerState.snapshot.url;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = localStorage.getItem('access_token') || '';
    const refresh_token: string = localStorage.getItem('refresh_token') || '';

    if (WHITELISTED_URLS.includes(req.url.replace(Config.Host, ''))) {
      if (req.url.replace(Config.Host, '') == JWT_REFRESH_ENDPOINT) {
        const reqWithToken = req.clone({
          setHeaders: {
            Authorization: `Bearer ${refresh_token}`
          }
        })
        return next.handle(reqWithToken);
      }

      return next.handle(req);
    }

    if (token != "" && token != null) {
      const reqWithToken = this.addTokenHeader(req, token);

      return next.handle(this.addTokenHeader(req, token)).pipe(catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if(error.status === 401){
            return this.handle401Error(reqWithToken, next);
          }
          else if(error.status === 400){
            throw error;
          }
          else if(error.status === 200){
            throw error;
          }
        }
        this.router.navigate(['/login'], {
          queryParams: {
            return: this.returnUrl
          }
        })
        throw error;
      }))


    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          return: this.returnUrl
        }
      });
    }

    return next.handle(req);

  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      return this.data.refreshToken().pipe(
        switchMap((token: any) => {
          console.log("tu jest token")
          console.log(token.body.access_token)
          localStorage.setItem("access_token", token.body.access_token);

          return next.handle(this.addTokenHeader(request, token.body.access_token));
        }),
      )
    }
    throw "";
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    TokenInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class TokenInterceptorModule {
  static forRoot(): ModuleWithProviders<TokenInterceptorModule> {
    return {
      ngModule: TokenInterceptorModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    }
  }
}
