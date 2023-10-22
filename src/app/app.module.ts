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
import { SearchResultComponent } from './components/navbar/search-result/search-result.component';
import { ToastComponent } from './components/toast/toast.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsAccountComponent } from './components/settings/settings-account/settings-account.component';
import { CustomIconComponent } from './components/custom-icon/custom-icon.component';
import { ContextMenuFieldComponent } from './components/context-menu-field/context-menu-field.component';
import { FileRowComponent } from './components/file-row/file-row.component';
import { DirectoryRowComponent } from './components/directory-row/directory-row.component';

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
    SearchResultComponent,
    ToastComponent,
    RegisterComponent,
    SettingsComponent,
    SettingsAccountComponent,
    CustomIconComponent,
    ContextMenuFieldComponent,
    FileRowComponent,
    DirectoryRowComponent,
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
