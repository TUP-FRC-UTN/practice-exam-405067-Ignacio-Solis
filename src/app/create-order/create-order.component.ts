import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, FormArray, FormBuilder, Validators} from '@angular/forms';
import { Product } from '../models/Product';
import { uniqueProductsValidator } from '../validators/duplicateProductValidator';
import { noProductValidator } from '../validators/noProductValidator';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit{
  formBuilder : FormBuilder = inject(FormBuilder);
  httpClient : HttpClient = inject(HttpClient);

  apiProductArray : Product[] = [];
  ngOnInit(): void {
      this.getProductsFromApi();
  }

  productsForm = this.formBuilder.group({
    name: ["",Validators.required],
    email: [""],
    products: this.formBuilder.array([],[uniqueProductsValidator, noProductValidator])
  })
   
  get products() : FormArray {
    return this.productsForm.get("products") as FormArray;
  }
  addProduct() {
    const productForm = this.formBuilder.group({
      productName: ['Producto', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
    this.products.push(productForm);
  }
  

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  onSubmit() {
    console.log(this.productsForm.value);
    
  }
  
  getProductsFromApi() {
    this.httpClient.get<Product[]>("http://localhost:3000/products").subscribe(response => {
      this.apiProductArray = response;
    })
  }

  
}
