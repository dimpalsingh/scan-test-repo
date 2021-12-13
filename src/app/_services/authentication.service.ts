import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { User } from '@/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    public apiUrl = '';
    constructor(private http: HttpClient, private config: ConfigService) { 
        this.apiUrl = this.config.apiUrl;
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('accessToken')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(user_email, user_password) {
        return this.http.post<any>(`${this.apiUrl}/users/login.json`, { user_email, user_password })
            .pipe(map(data => {
                if(!data.error){
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('accessToken', JSON.stringify(data));
                    this.currentUserSubject.next(data);
                    return data;
                } else {
                    return null;
                }
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('accessToken');
        this.currentUserSubject.next(null);
    }
}