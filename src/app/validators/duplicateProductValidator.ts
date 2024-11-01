import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from "@angular/forms";

export function uniqueProductsValidator(formArray: AbstractControl): ValidationErrors | null {
    if (!(formArray instanceof FormArray)) return null;
  
    const productNames = formArray.controls.map(control => control.get('productName')?.value);
    const hasDuplicates = new Set(productNames).size !== productNames.length;
  
    return hasDuplicates ? { duplicateProducts: true } : null;
}