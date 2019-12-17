import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse, HttpInterceptor, HttpHeaders } from "@angular/common/http";
import { Observable, Subscriber, of, throwError } from 'rxjs';
import { tap, map, filter, catchError } from 'rxjs/operators';

import { AppSession } from '../config/app-session';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let bearerToken: any = AppSession.getSessionStorage("token") ? AppSession.getSessionStorage("token") : null;
        
        if (bearerToken) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${bearerToken}` }
            });

            /*request = request.clone({
                headers: request.headers.set('Authorization', 'Bearer ' + bearerToken)
            });*/
        }

        /*let headerSettings: {[name: string]: string | string[]; } = {};
        if(bearerToken){
            headerSettings['Authorization'] = 'Bearer ' + bearerToken;
        }
        let newHeader = new HttpHeaders(headerSettings);
        request = request.clone({ headers: newHeader });*/

        //return next.handle(request);
        return next.handle(request).pipe(catchError((error, caught) => {
            //intercept the respons error and displace it to the console
            console.log(error);
            this.handleAuthError(error);
            return of(error);
        }) as any);
    }

    handleAuthError(err: HttpErrorResponse): Observable<any> {
        //handle your auth error or rethrow
        if (err.status === 401) {
            //navigate /delete cookies or whatever
            console.log('handled error ' + err.status);
            this.router.navigateByUrl('error/unauthorized');
            // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
            return of(err.message);
        }
        throw err;
    }

    handleError(error: HttpErrorResponse) {
        let errMsg = '';
        // Client Side Error
        if (error.error instanceof ErrorEvent) {
            errMsg = `Error: ${error.error.message}`;
        }
        else {  // Server Side Error
            errMsg = `Error Code: ${error.status},  Message: ${error.message}`;
        }
        // return an observable
        return throwError(errMsg);
    };
}