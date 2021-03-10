import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  userRef: AngularFireObject<any>;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private shared: SharedService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.shared.userData = user
        this.shared.isLoggedIn = true
        this.shared.getBlockedIds()
      } else {
        this.shared.userData = null
        this.shared.isLoggedIn = false
      }
    });
  }

  // Sign in with Google
  twitterAuth() {
    return this.AuthLogin(new firebase.auth.TwitterAuthProvider());
  }


  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
      .then((result) => {
        this.saveToLocalStorage(result.credential)
        if (result.additionalUserInfo.isNewUser) {
          this.SetUserData(result.user, result.additionalUserInfo.profile, result.additionalUserInfo.username);
        }
      }).catch((error) => {
        window.alert(error);
      });
  }

  saveToLocalStorage(credentials) {
    localStorage.setItem('access_token', credentials.accessToken)
    localStorage.setItem('access_secret', credentials.secret)
  }

  SetUserData(user, profile, username) {
    const userData = {
      uid: user.uid,
      email: user.email,
      description: profile.description,
      name: profile.name,
      location: profile.location,
      username
    };
    this.userRef = this.db.object('users/' + user.uid);
    this.userRef.set(userData);
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('access_secret')
      this.shared.userData = null
      this.shared.isLoggedIn = false
    });
  }

}


// result.credentials.accessToken == oauth_token
//  result.crendentials.secret == oauth_token_secret
