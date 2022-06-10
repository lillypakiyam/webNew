import { Component, NgZone, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../service/api.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trip-fare',
  templateUrl: './trip-fare.component.html',
  styleUrls: ['./trip-fare.component.css']
})
export class TripFareComponent implements OnInit {

 private unSubscribe$ = new Subject(); 
  closeResult = '';
name:any
content:any

searchText: any=''
text: any
autoCompleteItems:any
autoComplete:any
searchdrop:any
 pickup_lat:any
 pickup_lng:any
 drop_lat:any
 drop_lng:any
 pic_address:any;
 drop_address:any;
 v1fare:any= [];
 v1farestate:any= [];
 v2fareStates:any=[];
public car={
  capacity:'',
  size:'',
  fare:'',
}
 public tripFare = {
  fare1: '',
  fare2: '',
  fare3: '',
  fare4: ''
};
  constructor(public api : ApiService,
    public zone:NgZone,
    public router:Router,
    public route:ActivatedRoute,
   public modalService: NgbModal) { 
    // console.log(this.route.snapshot.paramMap.get();
    console.log(this.router.getCurrentNavigation()?.extras.queryParams);
    this.v1fare.push(this.router.getCurrentNavigation()?.extras.queryParams)
    this.v1fare.forEach((data:any)=>{
        console.log(data.state, data.trip)
        this.tripFare.fare1 = data.trip
    console.log('vfare',this.tripFare.fare1);
     const vechicle1= data.state
     this.v1farestate=[]
     this.v1farestate.push(vechicle1)
     const vechicle2= data.states
     this.v2fareStates=[]
     this.v2fareStates.push(vechicle2)
     console.log(this.v1farestate,this.v2fareStates)
    })
   }

  ngOnInit(): void {
    this.name=this.api.username
    this.pic_address=this.api.pickup_address
    this.drop_address=this.api.dropup_address
    console.log(this.name)
    this.api.V1faredata.forEach((data:any)=>{
      console.log('data',data)
      this.car.capacity=data.capacity;
      this.car.size = data.size;
    })
    console.log(this.car.capacity, this.car.size)
    this.api.V2faredata.forEach((v2fare:any)=>{
      console.log('data',v2fare)
    })
  }

  
open(content: any) {
  this.modalService.open(content,
 {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
    this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
    this.closeResult = 
       `Dismissed ${this.getDismissReason(reason)}`;
  });
}

private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
    return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    return 'by clicking on a backdrop';
  } else {
    return `with: ${reason}`;
  }
}

async googleSearch(value:any){
  console.log('value',value)
  if(value){
    const predict:any = await this.api.getGooglePlaceAutoCompleteList(value)
     console.log('searchtext',this.searchText)
       this.autoCompleteItems = [];
      this.zone.run(() =>{
        if(predict !== null){
          predict.forEach((data:any) =>{
            console.log(data)
            this.text = data
            this.autoCompleteItems.push( data.description)
            console.log('autocomplete',this.autoCompleteItems)
          })
        }
      })
  }else{
    this.autoCompleteItems=[]
  }
  }

  getpicAddress(address:any){
    this.searchText=address
    this.api.pickup_address=address
    console.log('searchText',this.searchText)
    const geocode= this.api.getLatLan(address).subscribe((geocoder:any) =>{
      console.log('code',geocoder)
      const code= {lat: geocoder.lat(), lang: geocoder.lng()}
      console.log('code',code)
      this.pickup_lat =code.lat
      this.pickup_lng =code.lang
      console.log('pick',this.pickup_lat,this.pickup_lng)
      if(this.searchText){
        this.autoCompleteItems=[]
      }
      // this.getETA()
    } )
  }
  async googleSearchDrop(value:any){
    console.log('value',value.length)
    console.log('value',value)
  if(value){
    const predict:any = await this.api.getGooglePlaceAutoCompleteList(value)
      console.log('searchtext',this.searchText)
        this.autoComplete = [];
       this.zone.run(() =>{
         if(predict !== null){
           predict.forEach((data:any) =>{
             console.log(data)
             this.text = data
             this.autoComplete.push( data.description)
             console.log('autocomplete',this.autoComplete)
           })   
         }
       })
      }else{
        this.autoComplete=[]
      }
    }

    getdropAddress(address:any){
      this.searchdrop=address
      this.api.dropup_address=address
      console.log('address',this.searchdrop)
      const geocode= this.api.getLatLan(address).subscribe((geocoder:any) =>{
        console.log('code',geocoder)
        const code= {lat: geocoder.lat(), lang: geocoder.lng()}
        console.log('code',code)
        this.drop_lat =code.lat
        this.drop_lng =code.lang
        console.log('pick',this.pickup_lat,this.pickup_lng)
        if(this.searchText){
         this.autoComplete=[]
       }
        this.getETA()
      } )
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
            eta = Math.round(result.rows[0].elements[0].distance.value / 1000);
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
  
    async GetEstimate(){
      const dist = await this.getETA();
      this.api.getData().pipe(takeUntil(this.unSubscribe$)).subscribe(data => {
       console.log('fare data',data);
       const vehicles1 =data.find((dat:any) => dat.id === 'tata_ace');
       this.api.V1faredata.push( vehicles1)
       console.log('v1',vehicles1,this.api.V1faredata);
       const vehicles2 = data.find((dat:any) => dat.id === 'tata_ace_closed');
       this.api.V2faredata.push( vehicles2)
       // this.api.V2faredata = vehicles2
       console.log('v2',vehicles2,this.api.V2faredata)
       this.api.getJHLPR().pipe(take(1)).subscribe(rsfare => {
         console.log('v3',rsfare);
         const hlpr = rsfare;
         this.tripFare.fare1 =  this.fareCalculator(vehicles1, dist);
         this.api.fare1 = this.tripFare.fare1;
         this.tripFare.fare2 = this.fareCalculator(vehicles2, dist);
         this.api.fare2= this.tripFare.fare2;
         this.tripFare.fare3 = this.tripFare.fare1 + parseInt(hlpr[vehicles1.id]);
         this.tripFare.fare4 = this.tripFare.fare2 + parseInt(hlpr[vehicles2.id]);  
         this.api.fare4 = this.tripFare.fare4   
         console.log('tripfare',this.tripFare);
       })
      });
     }

    fareCalculator(transport:any, trip_distance:any){
      let vat:any , extras:any, initial_fare:any;
       const base_fare = transport.baseFare;
       const fixed_dist = parseInt(transport.fixedDistance).toFixed(1);
       if((trip_distance > 0) && (parseFloat(trip_distance) <= parseInt(fixed_dist))){
        vat = Number((parseInt(base_fare) / 100) * parseInt(transport.vat)).toFixed(2);
        initial_fare = Math.round(parseInt(base_fare) + parseInt(vat) + parseInt(transport.serviceFee));        
       }else if(parseFloat(trip_distance) === 0){
        vat = Number((parseInt(base_fare) / 100) * parseInt(transport.vat)).toFixed(2);
        initial_fare = Math.round(parseInt(base_fare) + parseInt(vat) + parseInt(transport.serviceFee)); 
       }else {
        extras = Math.round(((parseFloat(trip_distance) - parseInt(fixed_dist)) * parseInt(transport.farePerKm)))+ parseInt(base_fare); 
        vat = Number((parseInt(extras) / 100) * parseInt(transport.vat)).toFixed(2); 
        initial_fare =  Math.round(parseInt(extras) + parseInt(vat) + parseInt(transport.serviceFee));
        }
         return initial_fare;
     }
     
    
     
     getAddress(){
       this.GetEstimate()

     }
}
