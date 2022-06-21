import { Component, OnInit, ViewChild, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import {ApiService} from 'src/app/service/api.service'
declare const google: { maps: { DirectionsRenderer: new () => any; DirectionsService: new () => any; Map: new (arg0: any, arg1: { zoom: number; center: { lat: number; lng: number; }; }) => any; TravelMode: { DRIVING: any; }; }; }
// declare const google: { maps: { DirectionsRenderer: new () => any; DirectionsService: new () => any; Map: new (arg0: any, arg1: { zoom: number; center: { lat: number; lng: number; }; }) => any; TravelMode: { DRIVING: any; }; }; }
import { Observable, Subject, take, takeUntil } from 'rxjs';
import * as moment from 'moment';
@Component({
  selector: 'app-fare-calculator',
  templateUrl: './fare-calculator.component.html',
  styleUrls: ['./fare-calculator.component.css']
})
export class FareCalculatorComponent implements OnInit {
  private unSubscribe$ = new Subject(); 
  searchText:any;
  sourceLocation = '';
  destinationLocation = '';

 @ViewChild('mapElement') mapElement:any
  @ViewChild('textDirections') textDirections: any;
  // @ViewChild('nativeE',{static:false}) nativeE: any;
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();
  map: any;
   // prediction
   autoCompleteItems:any
   autoComplete: any
   pickup_lat:any
   pickup_lng:any
   drop_lat:any
   drop_lng:any
   text:any;
   helpers=true;
   loadtimes=true;
   loadunloadtimes=true;
   load_stat:any;
   load_end:any;
   unload_start:any;
   unload_end:any;
   loading_mints:any
   unloading_mints:any
   helperTimecalculate:any
   helperLoadTimecal:any
   helperTimeload: any
   carhide=true;
   carVat=true;
   vanhide=true;
   vanVat=true;
   helperhide=true;
   vatAddnone=true;
   
   vatAdd= false;
   totalLoad:any
   selectValue='1'
   public tripFare = {
    fare1: 0,
    fare2: 0,
    fare3: 0,
    fare4: 0
  };
  constructor(private zone: NgZone,
    private api: ApiService,
   private router : Router) { 
     
   }

  ngOnInit(): void {
    // this.loadMap();

  }

  // ngAfterViewInit():void{
   
  //   // this.loadMap();
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
         componentRestrictions: { country: ["LUX","BEL", "FRA", "DEU", "IN"]
          // || environment.COUNTRY 
        }
       }, (predictions:string) => {
        //  console.log(predictions)
         pred = predictions;
         resolve(true);
       });
     });
     return pred;
   }
  
  async googleSearch(value:any){
    // console.log('value',value)
    if(value){
      const predict:any = await this.getGooglePlaceAutoCompleteList(value)
       // console.log('searchtext',this.searchText)
         this.autoCompleteItems = [];
        this.zone.run(() =>{
          if(predict !== null){
            predict.forEach((data:any) =>{
             const text:any = data.description
              this.autoCompleteItems.push(data.description)
            })
          }
        })
    }else{
      this.autoCompleteItems=[]
    }
    }
  
    async googleSearchdrops(value:any){
      console.log('value',value)
      if(value){
        const predict:any = await this.getGooglePlaceAutoCompleteList(value)
         // console.log('searchtext',this.searchText)
           this.autoComplete = [];
          this.zone.run(() =>{
            if(predict !== null){
              predict.forEach((data:any) =>{
                // console.log(data)
                // this.text = data
                this.autoComplete.push( data.description)
                // console.log('autocomplete',this.autoComplete)
              })
            }
          })
      }else{
        this.autoComplete=[]
      }
      }
  
    getpicAddress(address:any){
      this.sourceLocation=address
      console.log('address',this.sourceLocation)
        this.autoCompleteItems = [];
        this.api.getLatLan(address).subscribe((geocode:any)=>{
        const code = {lat:geocode.lat(), lang:geocode.lng()}
          this.pickup_lat = code.lat
          this.pickup_lng = code.lang
          console.log(code)
        })
    }
    
    getdropAddress(address:any){
      this.destinationLocation=address
      console.log('address',this.destinationLocation)
        this.autoComplete = [];
        this.api.getLatLan(address).subscribe((geocode:any)=>{
          const code ={lat:geocode.lat(), lang:geocode.lng()}
          this.drop_lat = code.lat
          this.drop_lng = code.lang
          console.log(code)
          this.getETA()
        })
    }
  
//  loadMap(){
//   const nativeElement:any= this.mapElement.nativeElement
//   this.map = new google.maps.Map(nativeElement ,{
//     zoom: 7,
//     center: {lat: 41.8,lng:-87.65},
    
//   });
//   this.directionsRenderer.setMap(this.map);
//   this.directionsRenderer.setPanel(this.textDirections.nativeElement);
//   }
//   calculateAndDisplayRoute(){
//     this.directionsService.route(
//       {
//         origin: this.sourceLocation,
//         destination: this.destinationLocation,
//         travelMode: google.maps.TravelMode.DRIVING,
//       },
//       (response: any,status: any) =>{
//         if(status === "OK"){
//           this.directionsRenderer.setDirections(response);
//         // this.getETA()
  
//         }
//         else{
//           window.alert("Directions request failed due to " + status);
//         }
//       }
//     );
//   }

  async getETA(){
    //  var eta;
    let eta:any, dist:any, etas:any;
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
        //  console.log(result);
         if(status === "OK"){
          //  console.log(result);
          //  eta = Math.round(result.rows[0].elements[0].distance.value / 1000);
          dist = result.rows[0].elements[0].distance.value / 1000;
          eta = Math.round(result.rows[0].elements[0].duration.value/60)/60;
           this.searchText=dist
           resolve(true);
          //  console.log('eta',eta, 'min text', result.rows[0].elements[0].duration.text);
           console.log('dist',dist,'serdist',this.searchText);
         }else{
          //  console.log('Error Occurred');
           resolve(false);
         }
       }); 
      });
      // return eta;
      return { dist, eta };
   }

   selectChangeHandler(eve:any){
     console.log(eve.target.value)
    //  if(eve.target.value=== '0'){
    //    this.selectValue = eve.target.value
    //    console.log(this.selectValue)
    //  }
     if(eve.target.value=== '1'){
      this.selectValue = eve.target.value
      console.log(this.selectValue)
    }
    if(eve.target.value=== '2'){
      this.selectValue = eve.target.value
      console.log(this.selectValue)
    }
   }
  //  fare calculator
  async GetEstimate(){
    //  const dist = await this.getETA();
     const { dist, eta } = await this.getETA();
    //  console.log('etamin', eta);
     console.log('fare dist',dist);
     console.log('searchText dist',this.searchText);
     this.api.getData().pipe(takeUntil(this.unSubscribe$)).subscribe((data:any) => {
      console.log('fare data',data);
      const vehicles1 =data.find((dat:any) => dat.id === 'tata_ace');
      this.api.V1faredata.push( vehicles1)
      console.log('v1',vehicles1,this.api.V1faredata);
      const vehicles2 = data.find((dat:any) => dat.id === 'tata_ace_closed');
      this.api.V2faredata = vehicles2
      console.log('v2',vehicles2,this.api.V2faredata)
      this.api.getJHLPR().pipe(take(1)).subscribe(rsfare => {
        console.log('v3',rsfare);
        const hlpr = rsfare;
        if(this.api.vehicle_type === 'car'){
          if(this.api.furniture_ass === 'Yes'){
            // let hrs :number
            var furniture_hrs = (this.loading_mints+ this.unloading_mints) - hlpr.free_load_mints
            this.totalLoad = furniture_hrs
            console.log('furni hrs', furniture_hrs)
            if(furniture_hrs <= 0){
            var tripFare_fare1 =  this.fareCalculator(vehicles1, this.searchText);
            var furnit_fare = furniture_hrs * hlpr.furHelper_mint
            console.log('fareta', this.tripFare.fare1)
            if(this.vatAdd === true){
              this.tripFare.fare1 = Math.round(tripFare_fare1 * (17/100) + tripFare_fare1 + 0)
                this.carhide = true
                this.carVat = false
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
             console.log('tripFare_fare1',this.tripFare.fare1);
             console.log('furnit_fare <0', 0);
             console.log('total_fare with vat total', 0, "+", tripFare_fare1, "+",
             tripFare_fare1 * (17/100) + tripFare_fare1 + 0, "=", this.tripFare.fare1);

            }
            if(this.vatAdd === false){
              this.tripFare.fare1 = Math.round(tripFare_fare1 + 0)
                this.carhide = false
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('tripFare_fare1',this.tripFare.fare1);
                console.log('furnit_fare ', furnit_fare);
                console.log('total_fare without vat total', 0, "+", tripFare_fare1, "+",
                 "=", this.tripFare.fare1);
   
              }
           }else{
             var furnit_fare = furniture_hrs * hlpr.furHelper_mint
             var tripFare_fare1 =  this.fareCalculator(vehicles1, this.searchText);
             var Totaltripe_fare = Math.round(tripFare_fare1 + furnit_fare)
                console.log('car',tripFare_fare1);
                this.api.fare1 = Math.round(this.tripFare.fare1);
             if(this.vatAdd === true){
              this.tripFare.fare1 = Math.round(Totaltripe_fare * (17/100) + Totaltripe_fare)
                this.carhide = true
                this.carVat = false
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('total Totaltripe_fare',Totaltripe_fare);
                console.log('furnit_fare',furnit_fare);
                console.log('vat',Math.round(Totaltripe_fare * (17/100) + Totaltripe_fare));
                console.log('total fare vat',this.tripFare.fare1);
              }
            if(this.vatAdd === false){
              this.tripFare.fare1 = Math.round(Totaltripe_fare)
                this.carhide = false
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('total Totaltripe_fare',Totaltripe_fare);
                console.log('furnit_fare',furnit_fare);
                console.log('total fare without vat',this.tripFare.fare1);
              }
           
           }
          }else{
            // furniture no
           console.log('helperTimecalculate',this.helperTimecalculate)
            // 0.585  loding time + car
            // var furniture_hrs = (this.loading_mints+ this.unloading_mints) - hlpr.free_load_mints
            // console.log('furni hrs no', furniture_hrs)
            //this.helperTimeload = this.helperLoadTimecal - hlpr.free_load_mints
           var furniture_hrs = this.helperLoadTimecal - hlpr.free_load_mints
            this.totalLoad = furniture_hrs * hlpr.extra_fare
            console.log('loadcal_no', this.totalLoad)
            // var loadcal_no= this.calculateHLPLoading(hlpr, eta) 
        if(furniture_hrs <= 0){ //   -->
            var tripe_car =  Math.round(this.fareCalculator(vehicles1, this.searchText) + 0 );
           console.log('tripe_car', tripe_car)
           if(this.vatAdd === true){
            console.log('car',tripFare_fare1);
            this.tripFare.fare1 = Math.round(tripe_car * (17/100) + tripe_car)
            // this.tripFare.fare1 =  Math.round(this.fareCalculator(vehicles1, dist) + this.calculateHLPFr(hlpr, eta));
                this.carhide = true
                this.carVat = false
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('tripFare_fare1',this.tripFare.fare1);
                console.log('helper time',this.calculateHLPFr(hlpr, eta), "+", tripFare_fare1, "+", 0,
                "+", Math.round(tripe_car * (17/100)),
                "=", this.tripFare.fare1);
              }
              if(this.vatAdd === false){
                // var tripFare_fare1 =  this.fareCalculator(vehicles1, dist);
                var tripFare_fare1 =  this.fareCalculator(vehicles1, this.searchText);
                console.log('tripFare_fare1',tripFare_fare1);
                this.tripFare.fare1 = Math.round(tripFare_fare1 + this.calculateHLPFr(hlpr, eta) + 0)
                // this.tripFare.fare1 = Math.round(tripFare_fare1 +this.calculateHLPFr(hlpr, eta))
                // this.tripFare.fare1 =  Math.round(this.fareCalculator(vehicles1, dist) + this.calculateHLPFr(hlpr, eta));
                    this.carhide = true
                    this.carVat = false
                    this.vanhide = true
                    this.vanVat = true
                    this.helperhide = true
                    this.vatAddnone= true
                    console.log('tripFare_fare1',this.tripFare.fare1);
                    console.log('helper time',this.calculateHLPFr(hlpr, eta), "+", tripFare_fare1,"+", 0, "=", this.tripFare.fare1);
                  }

           }else{
             var tripFare_fare1 =  this.fareCalculator(vehicles1, this.searchText);
            // var tripe_car =  Math.round(this.fareCalculator(vehicles1, this.searchText) +  this.calculateHLPFr(hlpr, eta) + this.totalLoad);
            var tripe_car =  Math.round(this.fareCalculator(vehicles1, this.searchText) + this.totalLoad);
            // var tripe_car =  Math.round(this.fareCalculator(vehicles1, this.searchText));
           console.log('tripe_car', tripe_car);
           this.api.fare1 = Math.round(this.tripFare.fare1);
            if(this.vatAdd === true){
            console.log('car',tripFare_fare1);
            this.tripFare.fare1 = Math.round(tripe_car * (17/100) + tripe_car)
            // this.tripFare.fare1 =  Math.round(this.fareCalculator(vehicles1, dist) + this.calculateHLPFr(hlpr, eta));
                this.carhide = true
                this.carVat = false
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('tripFare_fare1',this.tripFare.fare1);
                console.log('helper time',this.calculateHLPFr(hlpr, eta), "+", tripFare_fare1, "+", this.totalLoad,
                "+", Math.round(tripe_car * (17/100)),
                "=", this.tripFare.fare1);
              }
              if(this.vatAdd === false){
                // var tripFare_fare1 =  this.fareCalculator(vehicles1, dist);
                var tripFare_fare1 =  this.fareCalculator(vehicles1, this.searchText);
                console.log('tripFare_fare1',tripFare_fare1);
                // this.tripFare.fare1 = Math.round(tripFare_fare1 + this.calculateHLPFr(hlpr, eta) + this.totalLoad)
                this.tripFare.fare1 = Math.round(tripFare_fare1 + this.totalLoad) //-->
                // this.tripFare.fare1 = Math.round(tripFare_fare1 )
                  // this.tripFare.fare1 = Math.round(tripFare_fare1 +this.calculateHLPFr(hlpr, eta))
                // this.tripFare.fare1 =  Math.round(this.fareCalculator(vehicles1, dist) + this.calculateHLPFr(hlpr, eta));
                    this.carhide = true
                    this.carVat = false
                    this.vanhide = true
                    this.vanVat = true
                    this.helperhide = true
                    this.vatAddnone= true
                    console.log('tripFare_fare1',this.tripFare.fare1);
                    console.log('helper time', tripFare_fare1,"+", this.totalLoad, "=", this.tripFare.fare1);
                  }
           } //-->
          
          }
        }


        // van start
        if(this.api.vehicle_type === 'van'){
          if(this.api.furniture_ass === 'Yes'){
            var furniture_hrs = (this.loading_mints+ this.unloading_mints) - hlpr.free_load_mints
            console.log('furni hrs', furniture_hrs)
            var furnit_fare = furniture_hrs * hlpr.furHelper_mint
            console.log('furniture fare', furnit_fare)
            if(furniture_hrs <= 0){
              var tripFare_fare2 = this.fareCalculator(vehicles2, this.searchText);
               // this.tripFare.fare2 = Math.round(tripFare_fare2 + this.calculateHLPFr(hlpr, eta) + furnit_fare);
              //  this.tripFare.fare2 = Math.round(tripFare_fare2 + 0);
             var totalTrip = Math.round(tripFare_fare2);
              console.log('van',totalTrip);
              if(this.vatAdd === true){
                this.tripFare.fare2 = Math.round(totalTrip * (17/100) + totalTrip + 0)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = false
                  this.helperhide = true
                  this.vatAddnone= true
               console.log('tripFare_fare1',this.tripFare.fare2);
               console.log('total with vat',Math.round(totalTrip * (17/100)) + totalTrip + 0, "=", this.tripFare.fare2);
  
              }
              if(this.vatAdd === false){
                this.tripFare.fare2 = Math.round(totalTrip + 0)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = false
                  this.vanVat = true
                  this.helperhide = true
                  this.vatAddnone= true
                  console.log('tripFare_fare1',this.tripFare.fare2);
               console.log('total without vat', totalTrip + 0, "=", this.tripFare.fare2);
              }
            }else{
              // this.tripFare.fare2 = Math.round(tripFare_fare2 + 0);
              if(this.vatAdd === true){
              var tripFare_fare2 = this.fareCalculator(vehicles2, this.searchText);
                  console.log('tripFare_fare2',tripFare_fare2);
                  var tripFarefare2 = Math.round(tripFare_fare2 + furnit_fare);
                this.tripFare.fare2 = Math.round(tripFarefare2 * (17/100) + tripFarefare2)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = false
                  this.helperhide = true
                  this.vatAddnone= true
               console.log('tripFare_fare1',this.tripFare.fare2);
               console.log('total with vat',Math.round(tripFarefare2 * (17/100)) + tripFare_fare2,"+",furnit_fare,
                "=", this.tripFare.fare2);
              }
              if(this.vatAdd === false){
                var tripFare_fare2 = this.fareCalculator(vehicles2, this.searchText);
                var tripFarefare2 = Math.round(tripFare_fare2 + furnit_fare);
                this.tripFare.fare2 = Math.round(tripFarefare2)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = false
                  this.helperhide = true
                  this.vatAddnone= true
                  console.log('tripFare_fare1',this.tripFare.fare2);
                  console.log('total without vat',tripFare_fare2,"+",furnit_fare,
                  "=", this.tripFare.fare2);
                }
                  console.log('tripfare',this.tripFare.fare2);
            }
            // this.api.fare2= Math.round(this.tripFare.fare2);
            // console.log('tripfare',this.api.fare2);
          }else{
            var furniture_hrs = this.helperLoadTimecal - hlpr.free_load_mints
            this.totalLoad = furniture_hrs * hlpr.extra_fare
            console.log('loadcal_no', this.totalLoad)
            if(furniture_hrs <= 0){ //-->>>>restore
            // var fareTotal= Math.round(this.fareCalculator(vehicles2, this.searchText) + this.calculateHLPFr(hlpr, eta) + 0)//0.585;
            var fareTotal= Math.round(this.fareCalculator(vehicles2, this.searchText) + 0)//0.585;
              if(this.vatAdd === true){
                this.tripFare.fare2= Math.round(fareTotal * (17/100) + fareTotal )//0.585;
                      this.carhide = true
                      this.carVat = true
                      this.vanhide = true
                      this.vanVat = false
                      this.helperhide = true
                      this.vatAddnone= true
                      console.log('tripFare_fare1',this.tripFare.fare2);
                      console.log('total far with vat',Math.round(fareTotal * (17/100)), "+", fareTotal, "+",0, "=", this.tripFare.fare2);
                }
                if(this.vatAdd === false){
                  this.tripFare.fare2= Math.round(fareTotal)//0.585;
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = false
                  this.vanVat = true
                  this.helperhide = true
                  this.vatAddnone= true
                  console.log('tripFare_fare1',this.tripFare.fare2);
                  console.log('total fare without vat', fareTotal, "=", this.tripFare.fare2);
                }
            }else{  //---->>>>
              // var fareTotal= Math.round(this.fareCalculator(vehicles2, this.searchText) + this.calculateHLPFr(hlpr, eta) + this.totalLoad)//0.585;
              var fareTotal= Math.round(this.fareCalculator(vehicles2, this.searchText) + this.totalLoad)//0.585; //restore
              // var fareTotal= Math.round(this.fareCalculator(vehicles2, this.searchText) )//0.585;
              if(this.vatAdd === true){
              this.tripFare.fare2= Math.round(fareTotal * (17/100) + fareTotal)//0.585;
                    this.carhide = true
                    this.carVat = true
                    this.vanhide = true
                    this.vanVat = false
                    this.helperhide = true
                    this.vatAddnone= true
                    console.log('tripFare_fare1',this.tripFare.fare2);
                    console.log('total far with vat',Math.round(fareTotal * (17/100)) + fareTotal, "=", this.tripFare.fare2);
              }
              if(this.vatAdd === false){
                this.tripFare.fare2= Math.round(fareTotal)//0.585;
                this.carhide = true
                this.carVat = true
                this.vanhide = false
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= true
                console.log('tripFare_fare1',this.tripFare.fare2);
                console.log('total fare without vat', fareTotal, "=", this.tripFare.fare2);
              }
              
            } //restore
        }
        }

        if(this.api.vehicle_type === 'helper'){
          console.log('van', this.tripFare.fare2)
          if(this.selectValue === '1'){
            if(this.api.furniture_ass === 'Yes'){
              this.tripFare.fare2 = this.fareCalculator(vehicles2, this.searchText);
            this.api.fare2= this.tripFare.fare2;
            console.log('van', this.tripFare.fare2)
            // this.fareCalculator(vehicles2, dist)
            var furniture_hrss = this.loading_mints+ this.unloading_mints 
            var furniture_total_mints = furniture_hrss - hlpr.free_load_mints
            var furnit_fare = furniture_total_mints * hlpr.furHelper_mint
            console.log('total load time', "=",furniture_total_mints, furniture_hrss, "-", hlpr.free_load_mints)
            console.log('total load fare',furnit_fare)
            var helper_time= this.helperTimecalculate * hlpr.furHelper_mint
            console.log('helper_time', helper_time, "=",this.helperTimecalculate, "*", hlpr.furHelper_mint)
            if(furniture_total_mints <=0){
            var fare = this.calculateFurnit(hlpr, eta)
              if(this.vatAdd === true){
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
                console.log(this.vatAdd)
                console.log(tripFare_fare4)
                this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4 )
                console.log('total fare with vat',this.tripFare.fare4)
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= false
              }
              if(this.vatAdd === false){
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
                console.log(this.vatAdd)
                this.tripFare.fare4 = Math.round(tripFare_fare4)
                var van_helper = tripFare_fare4 
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = false
                this.vatAddnone= true
                console.log('total fare with vat',van_helper)
              }
              // console.log(tripFare_fare4)
              // this.tripFare.fare4 = tripFare_fare4;
              console.log('total fare',this.tripFare.fare4, "=", this.tripFare.fare2 ,"+", fare)
              console.log(this.tripFare.fare4)
            }else{
              if(this.vatAdd === true){
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta) + furnit_fare); 
                console.log(this.vatAdd)
                console.log(tripFare_fare4)
                this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4) 
                console.log('total fare with vat',this.tripFare.fare4)
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= false
                console.log('total fare with vat',this.tripFare.fare4)
              }
              if(this.vatAdd === false){
                console.log(this.vatAdd)
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta) + furnit_fare); 
              this.tripFare.fare4 = tripFare_fare4;
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = false
                this.vatAddnone= true
                console.log('total fare with vat',this.tripFare.fare4)
              }
              console.log('total fare',this.tripFare.fare4, "=", this.tripFare.fare2 ,"+", furnit_fare)
            }
         //  loadin start + unloading end = 1:40 = 100 *0.66= 66
           }else{
            var furniture_total_mints = this.helperLoadTimecal - hlpr.free_load_mints
            this.totalLoad = furniture_total_mints * hlpr.extra_fare
            console.log('loadcal_no', this.totalLoad)
            if(furniture_total_mints <=0){
              this.tripFare.fare2 = this.fareCalculator(vehicles2, this.searchText);
            var helper_time= this.helperTimecalculate * hlpr.extra_fare 
            console.log(helper_time ,"=", this.helperTimecalculate, "*", hlpr.extra_fare)
            // this.tripFare.fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta)+0); 
            if(this.vatAdd === true){
              // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta) +0 ); 
                console.log(this.vatAdd)
                console.log(tripFare_fare4)
                this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4) 
                console.log('total fare with vat',this.tripFare.fare4)
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= false
                console.log('total fare with vat',this.tripFare.fare4)
              }
              if(this.vatAdd === false){
                console.log(this.vatAdd)
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta) +0); 
              this.tripFare.fare4 = tripFare_fare4;
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = false
                this.vatAddnone= true
                console.log('total fare with vat',this.tripFare.fare4)
              }
            
            }else{
              this.tripFare.fare2 = this.fareCalculator(vehicles2, this.searchText);
              this.api.fare2= this.tripFare.fare2;
              var helper_time= this.helperTimecalculate * hlpr.extra_fare 
              console.log(helper_time ,"=", this.helperTimecalculate, "*", hlpr.extra_fare)
              // this.tripFare.fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta)); 
              if(this.vatAdd === true){
                // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
                var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta)+ this.totalLoad); 
                  console.log(this.vatAdd)
                  console.log(tripFare_fare4)
                  this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4) 
                  console.log('total fare with vat',this.tripFare.fare4)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = true
                  this.vatAddnone= false
                  console.log('total fare with vat',this.tripFare.fare4)
                }
                if(this.vatAdd === false){
                  console.log(this.vatAdd)
                var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta) +this.totalLoad); 
                this.tripFare.fare4 = tripFare_fare4;
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = false
                  this.vatAddnone= true
                  console.log('total fare with vat',this.tripFare.fare4)
                }
            }
           }
            
          }  

          if(this.selectValue === '2'){
          if(this.api.furniture_ass === 'Yes'){
            this.tripFare.fare1 =  this.fareCalculator(vehicles1, this.searchText);
            this.api.fare1 = this.tripFare.fare1;
            // console.log('tripfare',this.api.fare1);
            this.tripFare.fare2 = this.fareCalculator(vehicles2, this.searchText);
            this.api.fare2= this.tripFare.fare2;
            // console.log('van', this.tripFare.fare2)
            var furniture_hrss = this.loading_mints+ this.unloading_mints 
            var furniture_total_mints = furniture_hrss - hlpr.free_load_mints
            var furnit_fare = furniture_total_mints * hlpr.furHelper_mint
            var two_helpers = furnit_fare *2
            var two_heperfare = this.calculateFurnit(hlpr, eta) *2
            // console.log('2helpers furni',two_helpers, furnit_fare)
            // console.log('2helpers fare',two_heperfare)
            // this.api.fare4 = this.tripFare.fare4;
            if(furniture_total_mints <=0){
              if(this.vatAdd === true){
                // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
              // var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + two_helpers; 
            console.log('van', this.tripFare.fare2)
              var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + 0; 
                  console.log(this.vatAdd)
                  console.log(tripFare_fare4)
                  this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4 )
                  console.log('total fare with vat',this.tripFare.fare4)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = true
                  this.vatAddnone= false
                }
                if(this.vatAdd === false){
                // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
            console.log('van', this.tripFare.fare2)
            var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + 0; 
                  console.log(this.vatAdd)
                  this.tripFare.fare4 = Math.round(tripFare_fare4)
                  var van_helper = tripFare_fare4 
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = false
                  this.vatAddnone= true
                  console.log('total fare with vat',van_helper)
                }
              // this.tripFare.fare4 = Math.round(tripFare_fare4) //+ (17/100)
            }else{
              if(this.vatAdd === true){
                // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
              var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + two_helpers; 
              // var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + 0; 
                  console.log(this.vatAdd)
            console.log('van', this.tripFare.fare2)
            console.log(tripFare_fare4)
                  this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4 )
                  console.log('total fare with vat',this.tripFare.fare4)
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = true
                  this.vatAddnone= false
                }
                if(this.vatAdd === false){
                // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)+ 0); 
                // var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + 0; 
                 var tripFare_fare4 = this.tripFare.fare2 + two_heperfare + two_helpers; 
                  console.log(this.vatAdd)
                  this.tripFare.fare4 = Math.round(tripFare_fare4)
                  var van_helper = tripFare_fare4 
                  this.carhide = true
                  this.carVat = true
                  this.vanhide = true
                  this.vanVat = true
                  this.helperhide = false
                  this.vatAddnone= true
                  // console.log('total fare with vat',van_helper)
                  console.log('total fare without vat',this.tripFare.fare2 + two_heperfare + two_helpers, "=", this.tripFare.fare4)
                }
            }
           console.log('van', this.tripFare.fare4)
        }else{
          this.tripFare.fare2 = this.fareCalculator(vehicles2, this.searchText); 
          var twohelper_time=  this.calculateHLPFr(hlpr, eta) *2
          console.log('twohelper_time',twohelper_time)

          var furniture_total_mints = this.helperLoadTimecal - hlpr.free_load_mints
          var loadFare= furniture_total_mints * hlpr.extra_fare
          this.totalLoad = loadFare * 2
          console.log('loadcal_no', this.totalLoad)
          if(furniture_total_mints <=0){
            if(this.vatAdd === true){
              // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + twohelper_time + 0); 
                console.log(this.vatAdd)
                console.log(tripFare_fare4)
                this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4) 
                console.log('total fare with vat',this.tripFare.fare4)
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= false
                console.log('total fare with vat',this.tripFare.fare4)
              }
              if(this.vatAdd === false){
                console.log(this.vatAdd)
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + twohelper_time +0); 
              // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
              this.tripFare.fare4 = tripFare_fare4;
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = false
                this.vatAddnone= true
                console.log('total fare with vat',this.tripFare.fare4)
              }
          }else{

            // this.tripFare.fare4 = Math.round(this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta)); 
            if(this.vatAdd === true){
              // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + twohelper_time + this.totalLoad); 
                console.log(this.vatAdd)
                console.log(tripFare_fare4)
                this.tripFare.fare4 = Math.round(tripFare_fare4 * (17/100) + tripFare_fare4) 
                console.log('total fare with vat',this.tripFare.fare4)
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = true
                this.vatAddnone= false
                console.log('total fare with vat',this.tripFare.fare4)
              }
              if(this.vatAdd === false){
                console.log(this.vatAdd)
              var tripFare_fare4 = Math.round(this.tripFare.fare2 + twohelper_time + this.totalLoad); 
              // var tripFare_fare4 = Math.round(this.tripFare.fare2 + this.calculateFurnit(hlpr, eta)); 
              this.tripFare.fare4 = tripFare_fare4;
                this.carhide = true
                this.carVat = true
                this.vanhide = true
                this.vanVat = true
                this.helperhide = false
                this.vatAddnone= true
                console.log('total fare with vat',this.tripFare.fare4)
              }
           
          }
        }
      }
        }
        // console.log('tripfare',this.tripFare);
      })
     });

     
    }

    // furntiure ---> no  (35 euro)
    // van = 100
    // helper or driver = 35 euros
    // fare = 100 + 35 = 135

    // furniture ---> yes (40 euro)
    //  van = 100
    //  helper/hr = 40
    //  helper fare /mints = 0.66
    //  loading time = 10mints
    //  unloading time = 30mints
    //  total loading time = 40 mints - 15 mints(freeloading) =25 mints
    //  total furniture fare = 25 * 0.66 = 16.5
    //  tatal fare = van + helper fare+ furniture fare
    //  total fare = 100 + 40 + 16.5 = 156.5 eros

  
    calculateHLPFr(hlp:any,eta:any){
        console.log('helper details',hlp);
        // console.log('eta mints',eta);
        console.log('helperTimecalculate',this.helperTimecalculate)
      if(this.helperTimecalculate <= 60){
      let hlpFare = parseInt(hlp.basefare);
        console.log(hlpFare);
        return hlpFare;
      }else{
        let i = parseInt(this.helperTimecalculate) + parseInt(hlp.free_wait);
        console.log('extra_fare',parseInt(this.helperTimecalculate), "i",i)
       let hlpFare = i * (hlp.extra_fare);
        console.log('helpfare',hlpFare);
        console.log('extra_fare',hlp.extra_fare)
        return hlpFare;
      }
    }


    calculateFurnit(hlp:any,eta:any){
      // console.log('helper details',hlp);
      // console.log('eta mints',eta);
       let hlpFare = 0;
       if(this.helperTimecalculate <= 60){
        hlpFare = parseInt(hlp.furniture_helperfare);
      console.log(hlpFare);
      }else{
      let i = parseInt(this.helperTimecalculate) + parseInt(hlp.free_wait);
      hlpFare = i * (hlp.furHelper_mint);
      console.log('helpfare',hlpFare)
     }
    return hlpFare;
    }
    
    
    fareCalculator(transport:any, trip_distance:any){
      let vat:any , extras:any, initial_fare:any;
       const base_fare = transport.baseFare;
      //  const fixed_dist = parseInt(transport.fixedDistance).toFixed(1);
      const fixed_dist = transport.fixedDistance;
       if((trip_distance > 0) && (parseFloat(trip_distance) <= parseInt(fixed_dist))){   
        initial_fare = Math.round(parseInt(base_fare));        
        // console.log('1',base_fare, fixed_dist, initial_fare)     
       }else if(parseFloat(trip_distance) === 0){
        
        initial_fare = Math.round(parseInt(base_fare)); 
       }else {
        extras = Math.round(((parseFloat(trip_distance) - parseInt(fixed_dist)) * transport.farePerKm))+ parseInt(base_fare);  
        initial_fare =  Math.round(parseInt(extras));
        }
         return initial_fare;
     }
    //  calculator end

   getDistance(value:any){
     this.searchText = value
     console.log('distance',this.searchText)
   }

   vechicle(value:any){
    console.log(value)
   }

   hideHelper(values:any){
     if(values === 'car'){
       this.api.vehicle_type= values
       this.helpers= true
     console.log(this.api.vehicle_type)
    }
     if(values === 'van'){
      this.api.vehicle_type= values
      this.helpers= true
     console.log(this.api.vehicle_type)
    }
     if(values === 'helper'){
      this.api.vehicle_type= values
     this.helpers=false
     console.log(this.api.vehicle_type)
     }
   }

   loadtimesFurn(value:any){
    if(value === 'Yes'){
      this.api.furniture_ass = value
      console.log('y', this.api.furniture_ass)
      //  this.loadunloadtimes=true
       this.loadtimes= false
     }
     if(value === 'No'){
      this.api.furniture_ass = value
      console.log('n', this.api.furniture_ass)
       this.loadtimes=false
      //  this.loadunloadtimes=false
     }
   }

   timepick(ev:any){
    this.load_stat = ev.target.value
    console.log("load", this.load_stat)
    }

   timepick1(ev:any){
    this.load_end = ev.target.value
    console.log("load", this.load_end)
    // var startTime = moment(this.load_stat, 'HH:mm:ss a'); 12hours
    // var endTime = moment(this.load_end, 'HH:mm:ss a');
    var startTime = moment(this.load_stat, 'HH:mm');//24hours
    var endTime = moment(this.load_end, 'HH:mm');
   var duration = moment.duration(endTime.diff(startTime));
   var hours = (duration.asHours())*60;
   this.loading_mints = hours
    // var minutes = (duration.asMinutes()) % 60;
    // console.log("load_end", duration)
    console.log("loading time diff", this.loading_mints)
   }
   timepick2(ev:any){
    this.unload_start = ev.target.value
    console.log("load", this.unload_start)
   }
   timepick3(ev:any){
    this.unload_end= ev.target.value
    console.log("load", this.unload_end)
    // var startTime = moment(this.unload_start, 'HH:mm:ss a'); 12 hours
    // var endTime = moment(this.unload_end, 'HH:mm:ss a');
    var startTime = moment(this.unload_start, 'HH:mm');//24 hours
    var endTime = moment(this.unload_end, 'HH:mm');
   var duration = moment.duration(endTime.diff(startTime));
   var hours = (duration.asHours())*60;
   this.unloading_mints = hours
   console.log("unload time different", this.unloading_mints)
   // var minutes = (duration.asMinutes()) % 60;
  //  var startTi = moment(this.load_stat, 'HH:mm:ss a');
  //   var endTi = moment(this.unload_end, 'HH:mm:ss a'); 12 hrs
    var startTi = moment(this.load_stat, 'HH:mm');
    var endTi = moment(this.unload_end, 'HH:mm');
    // console.log("hr mins", startTi, endTi)
   var duration_for_helper = moment.duration(endTi.diff(startTi));
   var helper = (duration_for_helper.asHours())*60
   this.helperTimecalculate = helper
   console.log("helperTimecalculate", helper)
    // console.log("hr mins", duration_for_helper)
    this.helperLoadTimecal = this.loading_mints + this.unloading_mints
    console.log("helper load", this.helperLoadTimecal)
    
   }
   
   Estimate(){
     this.GetEstimate()
     console.log("getestimate")
     console.log("load",this.load_stat)
   }

   VATchange(evs:any){
     console.log('check',evs.target.checked)
     if(evs.target.checked === true){
       this.vatAdd = evs.target.checked
       console.log('vatadd',this.vatAdd)
     }
     if(evs.target.checked === false){
      this.vatAdd = evs.target.checked
      console.log('vatadd',this.vatAdd)
    }
   }
   displayTimePicker(event:any){
     console.log('datedsa')
     
   }
}
