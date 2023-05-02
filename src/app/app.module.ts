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
import { ModalComponent } from './components/modal/modal.component';
import { DirectoryTileComponent } from './components/directory-tile/directory-tile.component';
import { FileTileComponent } from './components/file-tile/file-tile.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { ItemDetailsRowComponent } from './components/item-details/item-details-row/item-details-row.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    NavbarComponent,
    MainWrapperComponent,
    FileCarouselComponent,
    SideNavbarComponent,
    ModalComponent,
    DirectoryTileComponent,
    FileTileComponent,
    FileUploadComponent,
    ItemDetailsComponent,
    ItemDetailsRowComponent,
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
