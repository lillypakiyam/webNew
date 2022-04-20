import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AfterGetEstimateComponent } from './after-get-estimate/after-get-estimate.component';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { DeliveryPartnerComponent } from './delivery-partner/delivery-partner.component';
import { HomeComponent } from './home/home.component';
import { ServicesComponent } from './services/services.component';
import { TripFareComponent } from './trip-fare/trip-fare.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'services',component:ServicesComponent},
  {path:'after-get-estimate',component:AfterGetEstimateComponent},
  {path:'delivery-partner',component:DeliveryPartnerComponent},
  {path:'trip-fare',component:TripFareComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  
  
],
  exports: [RouterModule],

})
export class AppRoutingModule { }
