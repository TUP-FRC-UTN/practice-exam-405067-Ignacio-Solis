import { inject, Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { OrderService } from "../services/order.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({providedIn: 'root'})
export class OrderValidator implements AsyncValidator{
    constructor (private orderService: OrderService) {}

    validate(control : AbstractControl) : Observable<ValidationErrors | null> {
        return this.orderService.doesClientExceedOrders(control.value).pipe(
            map((exceeds)=>
                 (exceeds? {exceedsOrders: true} : null)
            ),
            catchError(()=>of(null)),);
    }
} 
