import { Injectable } from '@angular/core';
import {CollectionReference, Firestore, getDocs, docData, Query, collection, doc } from '@angular/fire/firestore';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { map, Observable, take } from 'rxjs';


@Injectable({
  providedIn: 'any'
})
export class FirestoreService {


  constructor(private afStore: AngularFirestore) { }

  public getDT1(collect_name:string, sid:string): Observable<any>{
     return new Observable((observer) => {
       return this.afStore.collection(collect_name).doc(sid).get().pipe(take(1)).subscribe(data => {
         observer.next(data.data());
       }, err => { observer.error(err); })
     })
  }

  
  public getDT(collect_name:string, query:QueryFn): Observable<any>{
    const collection = this.afStore.collection(collect_name, query);
    return collection.get().pipe(
      map(snapshot => {
        let item: any= [];
        snapshot.docs.map(a => {
          let data:any = a.data();
          const id = a.id;
          item.push({ ...data, id })
        })
        return item;
      })
    );
    
  } 




}
