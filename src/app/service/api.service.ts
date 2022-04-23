import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';
import {environment} from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  pickup_address:any;
  dropup_address:any;
  username:any;
  pickup_lat:any
  pickup_lng:any
  drop_lat:any
  drop_lng:any
  V1faredata:any=[]
  V2faredata:any=[]
  V3faredata:any;
    fare1:any;
    fare2:any;
    fare3:any;
    fare4:any;
  constructor(private firestore: FirestoreService) { }

  public getData(): Observable<any>{
    return this.firestore.getDT('ScheduleVehicles', ref => ref
      .where('id', 'in', ['tata_ace', 'tata_ace_closed']));
  }

  public getJHLPR(): Observable<any>{
    // return this.firestore.getDT1('vehicleType', 'helper_fare');
    return this.firestore.getDT1('helper', 'helper');
  }
  


  // getVehicleType(vehicleTypeId): Observable<any> {
  //   return this.firestore.getDataOfId('vehicleType', vehicleTypeId);
  // }

  async getGooglePlaceAutoCompleteList(searchText:any) {
   
    const windows = ( window as {[google: string]: any })['google'] 
     const service = new windows.maps.places.AutocompleteService();
 
     let pred;
     // var circle = new google.maps.Circle(
     //     {center: geolocation, radius: 10000});
     // autocomplete.setBounds(circle.getBounds());
     await new Promise((resolve, reject) => {
       service.getPlacePredictions({
         input: searchText,
         componentRestrictions: { country: ["LUX", "BEL", "FRA", "DEU"] 
        //  || environment.COUNTRY 
        }
       }, (predictions:string) => {
         console.log(predictions)
         pred = predictions;
         resolve(true);
       });
     });
     return pred;
   }
  
   getLatLan(address: string): Observable<any> {
    console.log('address',address)
    let google =( window as {[google: string]: any })['google']
    const geocoder = new google.maps.Geocoder();
    console.log('geocoder',geocoder)
    return Observable.create((observer:any) => {
      geocoder.geocode({ address }, function (results :any, status: any) {
          console.log('res',results, status);
          if (status === google.maps.GeocoderStatus.OK) {
          observer.next(results[0].geometry.location);
          observer.complete();
        } else {
          console.log('Error - ', results, ' & Status - ', status);
          observer.next({ err: true });
          observer.complete();
        }
      });
    });
  }
  

  async getETA(){
    var eta;
    // console.log(this.rideInfo);
    let google =( window as {[google: string]: any })['google']
    const destination = new google.maps.LatLng(this.pickup_lat, this.pickup_lng);
    const origin = new google.maps.LatLng(this.drop_lat, this.drop_lng);
    const service = new google.maps.DistanceMatrixService();
    const request = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
     };
     await new Promise((resolve, rejected) => {
      service.getDistanceMatrix(request, (result:any, status:any) => {
        console.log(result);
        if(status === "OK"){
          console.log(result);
          eta = Math.round(result.rows[0].elements[0].distance.value)/1000;
          resolve(true);
          console.log('eta',eta);
        }else{
          console.log('Error Occurred');
          resolve(false);
        }
      }); 
     });
     return eta;
  }
  

}
