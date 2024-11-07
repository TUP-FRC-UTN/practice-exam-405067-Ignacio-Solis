import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../models/Product';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/Order';
import { JsonPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  httpClient : HttpClient = inject(HttpClient)
  constructor() { }

  getProducts() : Observable<Product[]> {
    return this.httpClient.get<Product[]>("http://localhost:3000/products")
  }

  doesClientExceedOrders(clientEmail: string) : Observable<boolean>{
    if (clientEmail == "") {
      return of(false)
    }
    const url = `http://localhost:3000/orders?email=${clientEmail}`
    return this.httpClient.get<Order[]>(url).pipe(
      map((response) => {
        let clientOrdersAmount : number = 0;
        response.forEach((order : Order) => {
          if (this.isOrderWithin24Hours(order.timestamp)) {
            clientOrdersAmount+=1
          }
        })
        
        return clientOrdersAmount >= 3; // Return true if client has more than 3 orders
      }),
      catchError((err) => {
        console.log("Ocurrio un error: " + err);
        return of(false); // Return false in case of an error
      })
    );
  }

  isOrderWithin24Hours(apiDateParam : string) : boolean{
    const apiDate = new Date(apiDateParam)
    const currentDate = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = Math.abs(currentDate.getTime() - apiDate.getTime());

    // Convert time difference to hours
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // Check if the difference is within 24 hours
    
    return hoursDifference <= 24;

  }
}
