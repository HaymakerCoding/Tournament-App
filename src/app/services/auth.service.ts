import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: boolean;
  private userName: string;
  private userId: number;

  constructor(private http: HttpClient) {

  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  getIsLoggedIn() {
    return this.isLoggedIn;
  }

  getUserName() {
    return this.userName;
  }

  getUserId() {
    return this.userId;
  }

  checkLoggedIn() {
    const headers = this.getHeaders();
    return this.http.get<any>('https://clubeg.golf/common/api_REST/v1/auth/check_logged_in.php',
    { headers })
    .pipe(map(response => {
      if (response.status === 200) {
        this.userId = +response.payload[2];
        this.isLoggedIn = true;
        this.userName = response.payload[0];
      } else {
        this.isLoggedIn = false;
      }
      return response;
    }));
  }

  login(form) {
    return this.http.post<any>('https://clubeg.golf/common/api_REST/v1/auth/login.php', {
      password: form.password,
      email: form.email
    }).pipe(map(response => {
      return response;
    }));
  }
}
