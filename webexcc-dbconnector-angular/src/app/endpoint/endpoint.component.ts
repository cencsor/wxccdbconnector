import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { GlobalConstants } from '../global-constants';
import * as uuid from 'uuid';

@Component({
  selector: 'app-endpoint',
  templateUrl: './endpoint.component.html',
  styleUrls: ['./endpoint.component.css']
})
export class EndpointComponent implements OnInit {
  isworking = true;
  isLoggedIn: boolean = false;
  showTab1 = true;
  showTab2: boolean = false;
  endpoints: any = [];
  endpoint: any = {};
  basicAuth: any = {};
  myConsole: any = '';
  base64ValuePlaceholder: any = '';
  private config = require("../../assets/env.json");

  connector: any = {
    type: ''
  };

  constructor(private restService: RestserviceService) {
    console.log('EndpointComponent : constructor');
    this.addonTokenChangeListener();
  }

  ngOnInit() {
    console.log('EndpointComponent: ngOnInit', this.isLoggedIn);
    this.isLoggedIn = GlobalConstants.isLoggedIn;
    this.myConsole = '';
    this.getBasicAuth();
    this.getEndpoints();
    this.getConnector();
  }

  showAuthenticatioTabButton(tab: string): void {
    console.log('EndpointComponent: showAuthenticatioTabButton');
    this.myConsole = '';
    this.showTab1 = false;
    this.showTab2 = false;

    if (tab === 'tab1') {
      this.showTab1 = true;
    }
    if (tab === 'tab2') {
      this.showTab2 = true;
    }
  }

  addEndpoint(): void {
    console.log('EndpointComponent: addEndpoint');
    this.myConsole = '';
    this.showAuthenticatioTabButton('tab1');
    const newEndpoint: any = {};
    newEndpoint.name = this.uuidv4();
    newEndpoint.endpoint = '/rest/webexcc/' + newEndpoint.name;
    newEndpoint.nameValueList = [];
    this.endpoints.push(newEndpoint);
    this.endpoint = newEndpoint;
    this.endpoint.query = 'select ${ani} as ani';
    if (this.connector.type === 'Oracle') {
      this.endpoint.query = 'select ${ani} as ani from DUAL';
    }
    this.addNameValuePair({ name: 'ani', value: '1234567890' });
    this.highlightEndpoint();
  }

  deleteEndpoint(index: any): void {
    console.log('EndpointComponent: deleteEndpoint:', index);
    const answer = window.confirm('Are sure you want to delete this item ?');
    if (answer) {
      this.isworking = true;
      this.myConsole = '';
      this.restService.deleteEndpoint(this.endpoints[index])
        .subscribe(data => {
          this.basicAuth = data;
          if (this.basicAuth.Exception) {
            this.myConsole = atob(this.myConsole.Exception);
          } else {
            this.myConsole = 'Basic authentication was loaded.\n';
          }
          this.endpoints.splice(index, 1);
          this.isworking = false;
          this.endpoints[--index].isHighlighted = true;
        });
    } else {
      console.log('EndpointComponent: deleteEndpoint: NOT');
    }
  }


  addNameValuePair(nameValue: any): void {
    console.log('EndpointComponent: addNameValue:');
    this.myConsole = '';
    this.endpoint.nameValueList.push(nameValue);
  }

  deleteNameValuePair(index: any): void {
    console.log('EndpointComponent: deleteNameValuePair:');
    const answer = window.confirm('Are sure you want to delete this item ?');
    if (answer) {
      this.myConsole = '';
      this.endpoint.nameValueList.splice(index, 1);
      this.myConsole = 'Name value pair deleted';
    } else {
      console.log('EndpointComponent: deleteNameValuePair: NOT');
    }
  }

  getBasicAuth(): void {
    console.log('EndpointComponent: getBasicAuth');
    this.isworking = true;
    this.myConsole = '';
    this.restService.getBasicAuth()
      .subscribe(data => {
        this.basicAuth = data;
        if (this.basicAuth.Exception) {
          this.myConsole = atob(this.myConsole.Exception);
        } else {
          this.myConsole = 'Basic authentication was loaded.\n';
        }
        this.updateBasicAuthValue();
        this.isworking = false;
      });
  }

  getEndpoints(): void {
    console.log('EndpointComponent: getEndpoints');
    this.isworking = true;
    this.myConsole = '';
    this.restService.getEndpoints()
      .subscribe((data: any) => {
        this.endpoints = data;
        if (this.endpoints.Exception) {
          this.myConsole = atob(this.myConsole.Exception);
        } else {
          this.myConsole += 'Endpoints were loaded.\n';
        }
        if (this.endpoints[0] != null) {
          this.endpoint = this.endpoints[0];
          this.endpoint.isHighlighted = true;
        }
        this.isLoggedIn = true;
        this.isworking = false;
      });
  }


  uuidv4(): string {
    const myId = uuid.v4();
    return myId;
  }


  saveBasicAuthentication(): void {
    console.log('EndpointComponent: saveBasicAuthentication');
    this.isworking = true;
    this.myConsole = '';
    this.restService.saveBasicAuthentication(this.basicAuth)
      .subscribe((data: any) => {
        this.myConsole = data;
        if (this.myConsole.Exception) {
          this.myConsole = 'Exception:\n' + atob(this.myConsole.Exception);
        } else {
          this.myConsole = this.myConsole.response;
        }
        this.isworking = false;
      });
  }

  isNameValuePairValid(): boolean {
    let check = true;
    this.endpoint.nameValueList.forEach((nameValue: any) => {
      if (nameValue.name == null || nameValue.name === undefined || nameValue.name.length < 1) {
        alert('Invalid name value pair:\n Name can\'t be blank.');
        check = false;
      } else if (!isNaN(nameValue.name)) {
        alert('Invalid name value pair:\nName can\'t be a number.');
        check = false;
      } else if (/^[0-9-]/.test(nameValue.name)) {
        alert('Invalid name value pair:\nName can\'t start with a number or dash');
        check = false;
      } else if (/[ !@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g.test(nameValue.name)) {
        alert('Invalid name value pair:\nName can only contain the following characters be a-z A-Z 0-9.');
        check = false;
      }
    });
    return check;
  }


  saveEndpointAndTest(): void {
    console.log('EndpointComponent: saveEndpointAndTest');
    this.myConsole = '';
    this.endpoint.isHighlighted = undefined;
    if (!this.isNameValuePairValid()) {
      return;
    }
    this.isworking = true;

    this.restService.saveEndpointAndTest(this.endpoint)
      .subscribe((data: any) => {
        this.myConsole = data;
        if (this.myConsole.Exception) {
          this.myConsole = 'Exception:\n' + atob(this.myConsole.Exception);
        } else {
          const response = this.myConsole.response;
          const params = atob(this.myConsole.httpParams);
          const sqlStatement = atob(this.myConsole.sqlStatement);
          const authentication = this.myConsole.authentication;
          const jsonResponse = atob(this.myConsole.jsonResponse);
          this.myConsole = response + '\n';
          this.myConsole += 'Endpoint authentication is active:' + authentication + '\n';
          this.myConsole += 'Request:\n';
          this.myConsole += this.config.resourceUrl + this.endpoint.endpoint + params + '\n';
          this.myConsole += 'SQL Request:\n';
          this.myConsole += sqlStatement + '\n';
          this.myConsole += 'Response:\n';
          this.myConsole += jsonResponse + '\n';
        }
        this.endpoint.isHighlighted = true;
        this.isworking = false;
      });
  }

  updateBasicAuthValue(): void {
    console.log('EndpointComponent: basicAuthValue');
    this.myConsole = '';
    if (this.basicAuth.username.length < 12 || this.basicAuth.password.length < 12) {
      this.base64ValuePlaceholder = 'username and password must be 12 charactors';
      this.basicAuth.value = '';
    } else {
      this.basicAuth.value = btoa(this.basicAuth.username + ':' + this.basicAuth.password);
    }
  }

  selectEndpoint(endpoint: any): void {
    console.log('EndpointComponent: selectEndpoint');
    this.myConsole = '';
    this.endpoint = endpoint;
    this.highlightEndpoint();
  }

  setBasicAuthenticationRequired(event: any): void {
    console.log('EndpointComponent: setBasicAuthenticationRequired');
    this.saveBasicAuthentication();
  }

  highlightEndpoint(): void {
    console.log('EndpointComponent: highlightEndpoint');
    this.endpoints.forEach((endpoint: any) => {
      // - console.warn('endpoint:', endpoint);
      endpoint.isHighlighted = false;
    });
    this.endpoint.isHighlighted = true;
  }


  addonTokenChangeListener() {
    console.log('EndpointComponent addonTokenChangeListener:');
    this.restService.onTokenChange.subscribe({
      next: (event: any) => {
        console.log('EndpointComponent addonTokenChangeListener: Received message  ', event);
        if (event.access_token != '') {
          this.isLoggedIn = true;
          return;
        }
        this.isLoggedIn = false;
      }
    });
  }

  getConnector(): void {
    console.log('EndpointComponent: getConnector');
    this.isworking = true;
    this.restService.getConnector()
      .subscribe((data: any) => {
        // #console.log('EndpointComponent: getConnector', data);
        this.connector = data;
        this.isworking = false;
      });
  }
}
