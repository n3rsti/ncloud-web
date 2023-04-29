import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent} from "./components/login/login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DataService} from "./services/data.service";
import {HttpClientModule} from "@angular/common/http";
import {AuthGuard} from "./guards/auth.guard";
import {TokenInterceptorModule} from "./modules/token-interceptor/token-interceptor.module";
import { MainComponent } from './components/main/main.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MainWrapperComponent } from './components/main-wrapper/main-wrapper.component';
import { FileCarouselComponent } from './components/file-carousel/file-carousel.component';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { ModalComponent } from './components/modal/modal.component';
import { FileComponent } from './components/file/file.component';
import { DirectoryTileComponent } from './components/directory-tile/directory-tile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    NavbarComponent,
    MainWrapperComponent,
    FileCarouselComponent,
    SideNavbarComponent,
    FileDetailsComponent,
    ModalComponent,
    FileComponent,
    DirectoryTileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    TokenInterceptorModule
  ],
  providers: [
    DataService,
    AuthGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
