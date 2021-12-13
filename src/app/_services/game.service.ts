import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class GameService {
    apiUrl = '';
    constructor(private http: HttpClient, private config: ConfigService) { 
        this.apiUrl = this.config.apiUrl;
    }

    getActiveSession() {
        return this.http.get(`${this.apiUrl}/game/getActiveSession.json`);
    }

    start() {
        return this.http.post(`${this.apiUrl}/game/start.json`,{});
    }

    attack(by) {
        return this.http.post(`${this.apiUrl}/game/attack.json?by=${by}`,{});
    }
    
    heal(by) {
        return this.http.post(`${this.apiUrl}/game/heal.json?by=${by}`,{});
    }
    
    blast(by) {
        return this.http.post(`${this.apiUrl}/game/blast.json?by=${by}`,{});
    }

    giveUp() {
        return this.http.post(`${this.apiUrl}/game/giveUp.json`,{});
    }
}