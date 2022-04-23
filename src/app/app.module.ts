import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { ServicesComponent } from './services/services.component';
import { AfterGetEstimateComponent } from './after-get-estimate/after-get-estimate.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DeliveryPartnerComponent } from './delivery-partner/delivery-partner.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker'
import { MatFormFieldModule} from '@angular/material/form-field'
// import {} from '@angular/material/datepicker-togg'
import {MatNativeDateModule, } from '@angular/material/core'
// import {} from '@angular/material-momen'
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import {OverlayModule} from '@angular/cdk/overlay'
const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'services',component:ServicesComponent},
  {path:'after-get-estimate',component:AfterGetEstimateComponent},
  {path:'deliver-partner',component:DeliveryPartnerComponent}
];

import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { FirestoreService } from '../app/service/firestore.service';
import { ApiService } from '../app/service/api.service';
import { TripFareComponent } from './trip-fare/trip-fare.component';

export const firebase={
  production: false,
  // COUNTRY:'LUX',
  config:{
    apiKey: "AIzaSyDXJJVThNYT9aWBzDnbBf5JmThvSNp3VOQ",
    authDomain: "mycarrio-aed0f.firebaseapp.com",
    projectId: "mycarrio-aed0f",
    storageBucket: "mycarrio-aed0f.appspot.com",
    messagingSenderId: "760820028583",
    appId: "1:760820028583:web:4027a2098b779b8ee13782",
    measurementId: "G-1ZYK8SJLQD"
  }
}
@NgModule({
  declarations: [
    HomeComponent,
    ServicesComponent,
    AppComponent,
    AfterGetEstimateComponent,
    DeliveryPartnerComponent,
    TripFareComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    NgbModule,
    MatCardModule,
    MatButtonModule,OverlayModule,
    MatDatepickerModule,MatFormFieldModule,MatMomentDateModule,
    AngularFireModule.initializeApp(firebase.config),
    AngularFirestoreModule
  ],
  providers: [FirestoreService,MatFormFieldModule,MatDatepickerModule,MatNativeDateModule, ApiService],
  bootstrap:[AppComponent]
})
export class AppModule { }

