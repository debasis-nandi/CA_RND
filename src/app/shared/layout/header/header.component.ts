import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../../core/services/http.service';
import { ApiConfig } from '../../../core/config/api-config';
import { AppSession } from '../../../core/config/app-session';
import { IMenu } from '../../../core/models/menu.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.css']
})
export class HeaderComponent implements OnInit {

  menu: IMenu = {};
  loading: boolean = false;
  
  constructor(private router: Router, private service: HttpService) {
  }

  ngOnInit() {
    this.menu = AppSession.getSessionStorage("UserMenu") ? AppSession.getSessionStorage("UserMenu") : null;
    this.menu.Userdetail = AppSession.getSessionStorage("UserInfo") ? AppSession.getSessionStorage("UserInfo") : null;
  }

  signOut(){
    AppSession.clearSessionStorage("token");
    this.router.navigateByUrl('login');
  }

  redirectPreference(): void {
    this.router.navigateByUrl('preference');
  }

  isDashboard(): boolean{
    return (this.menu.Dashboard && this.menu.Dashboard.length > 0) ? true : false;
  }

  isMenu(): boolean{
    return (this.menu.Menu && this.menu.Menu.length > 0) ? true : false;
  }

  isAnalytics(): boolean{
    return (this.menu.Analytics && this.menu.Analytics.length > 0) ? true : false;
  }

  isAdmin(): boolean{
    return (this.menu.Admin && this.menu.Admin.length > 0) ? true : false;
  }

  isUserDetail(): boolean{
    return (this.menu.Userdetail) ? true : false;
  }



}