import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';

@Component({
  template: ''
})
export abstract class Service {

  protected _ApiBaseUrl = 'https://api.clubeg.golf/';

  constructor(protected http: HttpClient) { }

 

}
