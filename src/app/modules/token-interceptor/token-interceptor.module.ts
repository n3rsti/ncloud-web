import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest, HttpResponse
} from "@angular/common/http";
import {catchError, Observable, retry, take, tap, throwError} from "rxjs";
import {Router} from "@angular/router";
import {DataService} from "../../services/data.service";
import {Config} from "../../config";


const JWT_REFRESH_ENDPOINT = '/api/token/refresh'

const WHITELISTED_URLS = [
  '/api/logout',
  '/logout',
  JWT_REFRESH_ENDPOINT
]



export class TokenInterceptor implements HttpInterceptor {
  returnUrl = '';

  constructor(private router: Router, private data: DataService) {
    if (!this.router.routerState.snapshot.root.queryParams?.['return'] || this.router.routerState.snapshot.root.queryParams?.['return'] === '')
      this.returnUrl = this.router.routerState.snapshot.url;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = localStorage.getItem('access_token') || '';
    const refresh_token: string = localStorage.getItem('refresh_token') || '';

    if(WHITELISTED_URLS.includes(req.url.replace(Config.Host, ''))){
      if(req.url.replace(Config.Host, '') == JWT_REFRESH_ENDPOINT){
        const reqWithToken = req.clone({
          setHeaders: {
            Authorization: `Bearer ${refresh_token}`
          }
        })
        return next.handle(reqWithToken);
      }

      return next.handle(req);
    }

    if(token != "" && token != null){
      const reqWithToken = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

      next.handle(reqWithToken).subscribe((data) => {
        console.log(data);
        if(data instanceof HttpResponse){
          if(data.status === 200){
            console.log(data.body)
            localStorage.setItem("access_token", data.body["access_token"]);
          }
        }
      })
    }


    return next.handle(req);

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
export class TokenInterceptorModule{
  static forRoot(): ModuleWithProviders<TokenInterceptorModule>{
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
