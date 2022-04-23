import { Component } from '@angular/core';
import { Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CarrioWeb';
  navBaricon=true;
  constructor(private router:Router, 
       public api:ApiService){
router.events.subscribe((event) => {
  console.log(event);
})
}

goToPage(pageName:string):void{
this.router.navigate([`${pageName}`]);
}

webDelivery(){
  this.router.navigate(['/delivery-partner']);
}
clickhome(){
  // this.router.navigate(['/after-get-estimate'])
  console.log('refresh')
  // this.router.navigate(['/home'])
  this.api.V1faredata=[]
  this.api.V2faredata=[]

 }
 menuclick(){
   this.navBaricon=!this.navBaricon
 }
}