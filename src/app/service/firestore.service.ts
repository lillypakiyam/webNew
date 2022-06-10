import { Injectable } from '@angular/core';
import {CollectionReference, Firestore, getDocs, docData, Query, collection, doc } from '@angular/fire/firestore';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { map, Observable, take } from 'rxjs';
import {BaseDatabaseModel} from '../models/base-dto/base-dto.module'
import * as firebase from 'firebase/compat/app'
// import * as firebase from 'firebase/compat';
// import firebase from 'firebase/compat';
@Injectable({
  providedIn: 'any'
})
export class FirestoreService {


  constructor(private afStore: AngularFirestore) { }

    public async create<T extends BaseDatabaseModel>(collection: string, data: T):
  Promise<firebase.default.firestore.DocumentSnapshot<firebase.default.firestore.DocumentData>> {
  const doc = await this.afStore.collection<T>(collection).add(this.addCreatedAt(data));
  return doc.get();
}

// public updateField<T extends BaseDatabaseModel>(collection: string, subCollectionName: string, id: string, document: Partial<T>): Promise<any> {
//   return this.afStore.collection(collection).doc(id).collection(subCollectionName).add(this.addCreatedAt(document))
// };
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


  addCreatedAt(data:any) {
    return {
      ...data, createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    };
  }
  addUpdatedAt(data:any) {
    return { ...data, updatedAt: firebase.default.firestore.FieldValue.serverTimestamp() };
  }

}
