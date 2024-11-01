import { AbstractControl, FormArray, ValidationErrors } from "@angular/forms";

export function noProductValidator(formArray: AbstractControl): ValidationErrors | null {
    if (!(formArray instanceof FormArray)) return null;
    if (formArray.length == 0) {
        return {"noProduct" : true}
    }
    else return null;
}