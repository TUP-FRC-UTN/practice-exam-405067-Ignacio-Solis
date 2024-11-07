import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, FormArray, FormBuilder, Validators} from '@angular/forms';
import { Product } from '../models/Product';
import { uniqueProductsValidator } from '../validators/duplicateProductValidator';
import { noProductValidator } from '../validators/noProductValidator';
import { formatCurrency, JsonPipe } from '@angular/common';
import { OrderService } from '../services/order.service';
import { OrderValidator } from '../validators/OrderValidator';
import { QueueAction } from 'rxjs/internal/scheduler/QueueAction';
@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit{
  formBuilder : FormBuilder = inject(FormBuilder);
  httpClient : HttpClient = inject(HttpClient);
  orderService : OrderService = inject(OrderService)
  orderValidator : OrderValidator = inject(OrderValidator)

  apiProductArray : Product[] = [];
  ngOnInit(): void {
      this.getProductsFromApi();
  }


  productsForm = this.formBuilder.group({
    name: ["",Validators.required],
    email: ["",{asyncValidators: [this.orderValidator.validate.bind(this.orderValidator)],updateOn: 'blur'}],
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

    productForm.get("productName")?.valueChanges.subscribe((productName)=> {
      this.upgradeProductFields(productForm, productName || "")
    })
  }
  

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  onSubmit() {
    console.log(this.productsForm.value);
    const discount = this.calculateDiscount();
    this.doOrdersExceedStock()
    let orderCode = this.generateOrderCode()
    this.addDatesToProducts()
    this.checkForDuplicatedProducts();
    this.validateUserOrders();
    
  }
  
  getProductsFromApi() {
    this.orderService.getProducts().subscribe({
      next : (response) => {
        this.apiProductArray = response
      },
      error : (err) => {
        alert("Error al obtener los productos: " + err)
      }
    })
    
  }

  upgradeProductFields(productForm : FormGroup, productName: string) {
    //get API product values by name
    let apiProduct = this.apiProductArray.find(product => product.name === productName);
    
    productForm.patchValue({
      price: apiProduct?.price,
      stock : apiProduct?.stock,
      quantity: apiProduct?.stock
    })
  }

  calculateDiscount() {
    let total = 0;
    let totalWithDiscount : number = 0
    this.products.controls.forEach((product) =>{
      total += product.get("price")?.value
    })
    if (total > 1000) {
      totalWithDiscount = total - (total*0.10)
    }
    
  }
  doOrdersExceedStock() : void{
    
    for (let product of this.products.controls) {
      if (product.get("stock")?.value < product.get("quantity")?.value) {
          alert("No hay suficiente stock de " + product.get('name'))
        break;
      }
    }
  
  }

  generateOrderCode() : string{
    let orderCode : string = ""
    let userName = this.productsForm.get("name")?.value
    if (userName && userName.length > 0) {
      orderCode+= userName.charAt(0);
    }
    else return ""
    
    const userEmail = this.productsForm.get("email")?.value
    if (userEmail && userEmail.length > 0) {
      let userEmailArr = Array.from(userEmail)
      
      for (let i = userEmailArr.length -4;i < userEmailArr.length ;i++) {
        orderCode += userEmailArr[i]
      }
      
    }
    else return ""
    const today = new Date();
    orderCode += String(today.getHours() + "-")
    orderCode += String(today.getMinutes()+ "-")
    orderCode += String(today.getSeconds())

    return orderCode
  }
  
  addDatesToProducts() : void{
    
    this.products.controls.forEach((productFormGroup: any) => {
  
      productFormGroup.addControl('timestamp', new FormControl(new Date()));
      console.log(productFormGroup.value);
    });
  }

  checkForDuplicatedProducts(){
    const productNames = new Set<string>();

    for (const productFormGroup of this.products.controls) {
      const productName = productFormGroup.get('productName')?.value;
      if (productName && productNames.has(productName)) {
        alert("Hay productos duplicados")
        break;
      }
      productNames.add(productName);
    }
    
  }

  validateUserOrders() {
    const clientEmail = this.productsForm.get("email")?.value
    if (clientEmail) {
      const userOrders = this.orderService.doesClientExceedOrders(clientEmail).subscribe({
        next: (exceeds) => {
          if (exceeds) {
            alert("Se han realizado mas de 3 compras con ese email en las ultimas 24 horas")
          }
        }
      })
      
    }
    
  }
}
