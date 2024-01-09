import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { addressTypeValues, phoneTypeValues } from '../contacts/contact.model';
import { restrictedWords } from '../validators/restricted-words.validator';

@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  phoneTypes = phoneTypeValues;
  addressTypes = addressTypeValues;
  //nonNullable, hace que los elementos dentro del fb no sean nulos
  //excepto por lo que están marcados con null como dateobbirth o favoriteranking
  contactForm = this.fb.nonNullable.group({
  id: '',
  icon: '',
  personal: false,
  firstName: ['', [Validators.required, Validators.minLength(3)]],
  lastName: '',
  dateOfBirth: <Date | null>null,
  // dateOfBirth: '',
  favoritesRanking: <number | null> null,
  phones: this.fb.array([this.createPhoneGroup()]),
  address: this.fb.nonNullable.group({
    streetAddress: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    addressType: '',
  }),
    notes: ['', restrictedWords(['foo', 'bar'])],
  });
  constructor(private route: ActivatedRoute,
    private contactsService: ContactsService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) return

    this.contactsService.getContact(contactId).
      subscribe((contact) => {
        if(!contact) return;

        for(let i = 1; i < contact.phones.length; i++) {
          this.addPhone();
        }
        
        //con esta línea, nos ahorramos todos los setValue que están comentados más abajo
        //esta es la magia del formBuilder
        this.contactForm.setValue(contact);
        /* this.contactForm.controls.id.setValue(contact.id);
        this.contactForm.controls.firstName.setValue(contact.firstName);
        this.contactForm.controls.lastName.setValue(contact.lastName);
        this.contactForm.controls.dateOfBirth.setValue(contact.dateOfBirth);
        this.contactForm.controls.favoritesRanking.setValue(contact.favoritesRanking);
        this.contactForm.controls.phone.controls.phoneNumber.setValue(contact.phone.phoneNumber);
        this.contactForm.controls.phone.controls.phoneType.setValue(contact.phone.phoneType);
        this.contactForm.controls.address.controls.streetAddress.setValue(contact.address.streetAddress);
        this.contactForm.controls.address.controls.city.setValue(contact.address.city);
        this.contactForm.controls.address.controls.state.setValue(contact.address.state);
        this.contactForm.controls.address.controls.postalCode.setValue(contact.address.postalCode);
        this.contactForm.controls.address.controls.addressType.setValue(contact.address.addressType); */
      });
  }

  createPhoneGroup() {
    return this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: ''
    })
  }

  addPhone() {
    this.contactForm.controls.phones.push(this.createPhoneGroup());
  }

  get firstName() {
    return this.contactForm.controls.firstName;
  }

  get notes() {
    return this.contactForm.controls.notes;
  }

  saveContact() {
    /* console.log(this.contactForm.value);
 */
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      //next significa que cuando se complete el observable
      //regresemos a nuestra página principal de contactos
      next: () => this.router.navigate(['/contacts'])
    });
  }
}
