import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class SharedService {

  userData = null
  isLoggedIn = null
  isChanged = new BehaviorSubject(false);
  blockedUsers: any = []

  constructor(private http: HttpClient) { }

  getBlockedIds() {
    let token = localStorage.getItem('access_token')
    let secret = localStorage.getItem('access_secret')
    let data = { token, secret }
    this.http.post('http://localhost:3000/get-blocked-users', data).subscribe(res => {
      this.blockedUsers = res['users']
      this.isChanged.next(true)
    })
  }

  blockUser(screen_name) {
    let token = localStorage.getItem('access_token')
    let secret = localStorage.getItem('access_secret')
    let data = { token, secret, screen_name }
    return this.http.post('http://localhost:3000/block-user', data)
  }

  unblockUser(screen_name) {
    let token = localStorage.getItem('access_token')
    let secret = localStorage.getItem('access_secret')
    let data = { token, secret, screen_name }
    return this.http.post('http://localhost:3000/unblock-user', data)
  }


}
