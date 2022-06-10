import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router'
@Component({
  selector: 'app-delivery-partner',
  templateUrl: './delivery-partner.component.html',
  styleUrls: ['./delivery-partner.component.css']
})
export class DeliveryPartnerComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit(): void {
  }

  calculator(){
    this.router.navigate(['/fare-calculator'])
  }
}
