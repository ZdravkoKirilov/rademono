import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export * from './game-mechanics';
export * from './transport';
export * from './render-kit';

@Injectable()
export class SomeService {

    name = new BehaviorSubject('Tosho');

}