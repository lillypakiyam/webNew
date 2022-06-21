import { Component, NgZone, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../service/api.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-after-get-estimate',
  templateUrl: './after-get-estimate.component.html',
  styleUrls: ['./after-get-estimate.component.css']
})
export class AfterGetEstimateComponent implements OnInit {

 private unSubscribe$ = new Subject(); 

  pickup:any
  drop:any
  searchText: any=''
text: any
autoCompleteItems:any
autoComplete:any
searchdrop:any
 pickup_lat:any
 pickup_lng:any
 drop_lat:any
 drop_lng:any
 closeResult = '';
 content:any;
 usename:any;

 public v1fare:any= [];
 v1farestate:any=[];
 v2fareStates:any=[];
 carFare:any
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
  constructor(public api: ApiService,
    public zone:NgZone,
    public route:ActivatedRoute,
    public router:Router,
    public modalService: NgbModal) {
          this.v1fare=[]
          this.carFare =[]

          this.route.queryParams.pipe(take(1)).subscribe(() => {
            this.v1fare.push(this.router.getCurrentNavigation()?.extras.state);
         });
      // console.log(this.router.getCurrentNavigation()?.extras.state);
      this.v1fare.forEach((data:any=[])=>{
        // console.log(data)
        this.v1farestate=[];
        this.v1farestate.push(data.car)
        this.v2fareStates=[];
        this.v2fareStates.push(data.van)
      })
     

     }

  ngOnInit(): void {
    this.pickup =this.api.pickup_address
    this.drop = this.api.dropup_address
    this.usename=this.api.username
    // console.log(this.usename)
   
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
    // console.log('value',value)
    if(value){
      const predict:any = await this.api.getGooglePlaceAutoCompleteList(value)
      //  console.log('searchtext',this.searchText)
         this.autoCompleteItems = [];
        this.zone.run(() =>{
          if(predict !== null){
            predict.forEach((data:any) =>{
              // console.log(data)
              this.text = data
              this.autoCompleteItems.push( data.description)
              // console.log('autocomplete',this.autoCompleteItems)
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
      // console.log('searchText',this.searchText)
      const geocode= this.api.getLatLan(address).subscribe((geocoder:any) =>{
        // console.log('code',geocoder)
        const code= {lat: geocoder.lat(), lang: geocoder.lng()}
        // console.log('code',code)
        this.pickup_lat =code.lat
        this.pickup_lng =code.lang
        // console.log('pick',this.pickup_lat,this.pickup_lng)
        if(this.searchText){
          this.autoCompleteItems=[]
        }
        // this.getETA()
      } )
    }
    async googleSearchDrop(value:any){
      // console.log('value',value.length)
      // console.log('value',value)
    if(value){
      const predict:any = await this.api.getGooglePlaceAutoCompleteList(value)
        // console.log('searchtext',this.searchText)
          this.autoComplete = [];
         this.zone.run(() =>{
           if(predict !== null){
             predict.forEach((data:any) =>{
              //  console.log(data)
               this.text = data
               this.autoComplete.push( data.description)
              //  console.log('autocomplete',this.autoComplete)
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
        // console.log('address',this.api.dropup_address)
        const geocode= this.api.getLatLan(address).subscribe((geocoder:any) =>{
          // console.log('code',geocoder)
          const code= {lat: geocoder.lat(), lang: geocoder.lng()}
          // console.log('code',code)
          this.drop_lat =code.lat
          this.drop_lng =code.lang
          // console.log('pick',this.drop_lat,this.drop_lng)
          if(this.searchText){
           this.autoComplete=[]
         }
          this.getETA()
        } )
      }

      async getETA(){
        // var eta;
        // console.log(this.rideInfo);
    let eta:any, dist:any;
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
            // console.log(result);
            if(status === "OK"){
              // console.log(result);
              // eta = Math.round(result.rows[0].elements[0].distance.value / 1000);
              dist = Math.round(result.rows[0].elements[0].distance.value / 1000);
              eta = Math.round(result.rows[0].elements[0].duration.value / 60);
              // console.log(result.rows[0].elements[0].duration.text);
              resolve(true);
              // console.log('eta',eta);
            }else{
              // console.log('Error Occurred');
              resolve(false);
            }
          }); 
         });
      return { dist, eta };
      // return eta;
      }

      //farecalcu
      async GetEstimate(){
        // const dist = await this.getETA();
       const { dist, eta } = await this.getETA();
        // console.log('fare dist',dist);
        this.api.getData().pipe(takeUntil(this.unSubscribe$)).subscribe(data => {
        //  console.log('fare data',data);
         const vehicles1 =data.find((dat:any) => dat.id === 'tata_ace');
         if(data.find((dat:any) => dat.id === 'tata_ace')){
           this.v1farestate=[]
           this.api.V1faredata.push(vehicles1)
           this.v1farestate.push(this.api.V1faredata)
         }
        //  console.log('v1',vehicles1,this.v1farestate);
         const vehicles2 = data.find((dat:any) => dat.id === 'tata_ace_closed');
         if(data.find((dat:any) => dat.id === 'tata_ace_closed')){
           this.v2fareStates=[]
           this.api.V2faredata.push(vehicles2)
           this.v2fareStates.push(this.api.V2faredata)
         }
        //  console.log('v2',vehicles2,this.v2fareStates)
         this.api.getJHLPR().pipe(take(1)).subscribe(rsfare => {
          //  console.log('v3',rsfare);
           const hlpr = rsfare;
           this.tripFare.fare1 =  this.fareCalculator(vehicles1, dist);
           this.api.fare1 = this.tripFare.fare1;
           this.tripFare.fare2 = this.fareCalculator(vehicles2, dist);
           this.api.fare2= this.tripFare.fare2;
           this.tripFare.fare3 = this.tripFare.fare1 + this.calculateHLPFr(hlpr, eta);
      this.tripFare.fare4 = this.tripFare.fare2 + this.calculateHLPFr(hlpr, eta); 
           this.api.fare4 = this.tripFare.fare4;
          //  console.log(this.api.fare1, 'fare2',this.api.V2faredata)
          //  console.log('tripfare',this.tripFare);
         })
        });
       }

       calculateHLPFr(hlp:any,eta:any){
        let hlpFare = 0;
        if(eta <= 60){
          hlpFare = parseInt(hlp.basefare);
          // console.log(hlpFare);
        }else{
          let i = parseInt(eta) + parseInt(hlp.free_wait);
          hlpFare = i * parseInt(hlp.extra_fare);
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
  getEstimate(){
        this.pickup=this.api.pickup_address
        this.drop = this.api.dropup_address
        this.api.V1faredata=[];
        this.api.V2faredata=[];
        this.v1farestate=[];
        this.v2fareStates=[];
        this.GetEstimate()
        this.router.navigate(['/after-get-estimate'])
      }
}
