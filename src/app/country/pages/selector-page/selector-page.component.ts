import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, firstValueFrom, Observable, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry} from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,
  ) {
    this.myForm = this.fb.group({
      region : ['', Validators.required ],
      country: ['', Validators.required ],
      border: ['', Validators.required ],
    });
  }

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanges();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('country')!.setValue('') ),
      tap( () => this.borders = [] ),
      switchMap( region => this.countriesService.getCountriesByRegion(region) )
    )
    .subscribe( countries => {
      this.countriesByRegion = countries;
    });
  }

  onCountryChanges():void {
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ),
      filter( (value: string) => value.length > 0 ),
      switchMap( ( alphaCode ) => this.countriesService.getCountryByAlphaCode( alphaCode ) ),
      switchMap( country => this.countriesService.getCountryBordersByCode( country.borders ) ),
    )
    .subscribe( countries => {
      this.borders = countries;
    });
  }

}
