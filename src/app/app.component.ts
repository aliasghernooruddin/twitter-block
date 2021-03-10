import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { SharedService } from './shared.service';


const ELEMENT_DATA = [
  { name: 'Twitter', screen_name: 'Twitter', blocking: false },
  { name: 'Jack', screen_name: 'jack', blocking: false },
  { name: 'apompliano', screen_name: 'APompliano', blocking: false },
  { name: 'Michael Saylor', screen_name: 'michael_saylor', blocking: false },
  { name: "Sean Cook", screen_name: "theSeanCook", blocking: false }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'twitter-block';
  isLogin = false;

  data = [{
    blocking: true,
    screen_name: "theSeanCook",
    name: "Sean Cook"
  }]

  displayedColumns: string[] = ['name', 'screen_name', 'action'];
  dataSource = ELEMENT_DATA;

  constructor(private auth: AuthService, public shared: SharedService, private _snackBar: MatSnackBar) {
    this.shared.isChanged.subscribe(res => {
      if (res) {
        this.shared.blockedUsers.forEach(element => {
          var item = ELEMENT_DATA.find(x => x.screen_name == element.screen_name);
          if (item) {
            item.blocking = true;
          }
        });
        this.dataSource = ELEMENT_DATA
      }
    })
  }

  block(screen_name) {
    this.shared.blockUser(screen_name).subscribe(res => {
      if (res['status']) {
        var item = ELEMENT_DATA.find(x => x.screen_name == screen_name);
        if (item) {
          item.blocking = true;
          this.openSnackBar('User Blocked Successfully!')
        }
      }
    })
  }

  unblock(screen_name) {
    this.shared.unblockUser(screen_name).subscribe(res => {
      if (res['status']) {
        var item = ELEMENT_DATA.find(x => x.screen_name == screen_name);
        if (item) {
          item.blocking = false;
          this.openSnackBar('User Unblocked Successfully!')
        }
      }
    })
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 2000,
    });
  }


  login() {
    this.auth.twitterAuth()
  }

  logout() {
    this.auth.SignOut()
  }


}
