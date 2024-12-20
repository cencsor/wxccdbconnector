import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { GlobalConstants } from './global-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnChanges {
  title = 'dbConnector';
  public isLoggedIn: boolean = false;
  public isworking: boolean = true;
  public myToken: any;
  private config = require("../assets/env.json");

  constructor(private restService: RestserviceService) {
    console.log('AppComponent: constructor:');
    this.addonTokenChangeListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('AppComponent: ngOnChanges', changes);
  }

  ngOnInit() {
    console.log('AppComponent: ngOnInit');
    console.log("AppComponent: ngOnInit:client_id:", this.config.client_id);
    if (this.config.client_id === 'C742904541c47aa1bd95014237fea094664ea178cb1264b983061d9b79ecd484a') {
      //this is jiwyatt@cisco.com's client_id.
      //replace it with your client_id from https://developer.webex-cx.com/my-apps
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
      console.warn('AppComponent: you are using the wrong this.config.client_id');
    }

    // load property file 
    GlobalConstants.token = { "access_token": "", "expires_in": "", "refresh_token": "", "refresh_token_expires_in": "", "token_type": "Bearer", "orginzationId": "", "scope": "" };
    this.myToken = GlobalConstants.token;
    console.log('AppComponent: ngOnInit:window.location.search:', window.location.search);
    if (!window.location.search) {
      this.restService.getUserV2().subscribe(token => {
        console.log('AppComponent: ngOnInit:getUserV2:token', token);
        if (token == null) {
          // don't do this. will go into stupid loop 
          // - document.location.href = '/login';
          // - location.assign('/login');
          // have to do it this way


          const url = this.config.loginUrl
            + "response_type=" + this.config.response_type
            + "&client_id=" + this.config.client_id
            + "&redirect_uri=" + this.config.redirect_uri
            + "&scope=" + this.config.scope
            + "&state=" + this.config.state;
          console.log('AppComponent: ngOnInit:go here:url', url);


          document.location.href = url;

          return;
        }
        if (token.Exception) {
          return;
        }
        GlobalConstants.token = token;
        this.myToken = GlobalConstants.token;
        this.restService.onTokenChange.emit(token);
        console.log('AppComponent: ngOnInit:getUserV2:GlobalConstants.token', GlobalConstants.token);
      },
        error => {
          alert('Unable to communcate with the backend server');
        });
    }

    if (window.location.search) {
      console.log('AppComponent: ngOnInit:window.location.search');
      this.restService.login(window.location.search).subscribe(token => {
        console.log('AppComponent: ngOnInit:window.location.search:token', token);
        if (token == null) {
          return;
        }
        if (token.Exception) {
          return;
        }
        GlobalConstants.token = token;
        this.myToken = GlobalConstants.token;
        this.restService.onTokenChange.emit(token);

        console.log('AppComponent: ngOnInit:window.location.search:GlobalConstants.token', GlobalConstants.token);
        document.location.href = '/about';
      });
    }

  }


  loginButton() {
    console.log('AppComponent: loginButton');
    // - if (this.isLoggedIn) {
    // -   // life is good
    // -   this.restService.logout();
    // -   location.assign('/');
    // - } else {
    // -   location.assign('/');
    // - }
  }

  login() {
    document.location.href = this.config.loginUrl;
  }

  logout() {
    console.log('AppComponent: logout');
    this.restService.mylogoutV2().subscribe(token => {
      console.log('AppComponent: logout:token', token);
      GlobalConstants.token = token;
      this.myToken = GlobalConstants.token;
      this.restService.onTokenChange.emit(token);
      document.location.href = "https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout";
    });
  }

  addonTokenChangeListener() {
    console.log('AppComponent addonTokenChangeListener:');
    this.restService.onTokenChange.subscribe({
      next: (event: any) => {
        console.log('AppComponent addonTokenChangeListener: Received message  ', event);
        if (event.access_token != '') {
          this.isLoggedIn = true;
          return;
        }
        this.isLoggedIn = false;
      }
    });
  }

}
