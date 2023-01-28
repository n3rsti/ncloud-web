import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent} from "./components/login/login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DataService} from "./services/data.service";
import {HttpClientModule} from "@angular/common/http";
import {AuthGuard} from "./guards/auth.guard";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    DataService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
