import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { User } from '@/_models';

@Injectable({ providedIn: 'root' })
export class UserService {
    apiUrl = '';
    constructor(private http: HttpClient, private config: ConfigService) { 
        this.apiUrl = this.config.apiUrl;
    }

    getUser() {
        return this.http.get<User[]>(`${this.apiUrl}/users/getUser.json`);
    }

    register(user: User) {
        return this.http.post(`${this.apiUrl}/users/register.json`, user);
    }
}