import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TeeTime {
  id: string,
  price: number,
  date: Date,
  timeSlot: number,
  numberOfPlayers: number,
  booked: boolean,
  bookedBy: string,
  isGoodWeather,
  maxWeatherAdjustedPrice: number,
	teeTimesInventory: number;
	previousPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeeTimesheetService {

  teeTimes: Array<TeeTime>;

  maxPlayers = 4;

  constructor(
    private afs: AngularFirestore
  ) { }

  fetchTeeTimesForDate(date: Date): Observable<Array<TeeTime>> {
    const teeTimes$ = this.afs.collection<TeeTime>('tee-times').valueChanges().pipe( // TODO fetch by day
      map(teeTimes => {
        return this.teeTimeConversion(teeTimes);
      })
    );
    
    return teeTimes$;
  }

  book(teeTime: TeeTime, numberOfPlayers: number, email: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      console.log({teeTime, numberOfPlayers, email})
      if (!numberOfPlayers || numberOfPlayers > this.maxPlayers) {
        reject(`Invalid number of players, no more than ${this.maxPlayers}`);
      }
      
      if (!email || email.trim().length < 1) {
        reject("Invalid email");
      }
      await this.afs.collection('tee-times').doc(teeTime.id).update({booked: true, numberOfPlayers, bookedBy: email});
      resolve();
    });
  }

  teeTimeConversion(teeTimes: Array<any>) {
  
    const dateConverted = teeTimes.map((tt: any) => {
      return { 
        id: tt.id,
        date: tt.date.toDate(),
        price: tt.price/100,
        timeSlot: tt.timeSlot,
        numberOfPlayers: tt.numberOfPlayers,
        booked: tt.booked,
        bookedBy: tt.bookedBy
      }
    }) as Array<TeeTime>;

    const sortedByTimeSlot = dateConverted.sort((firstTT, secondTT) => {
      return firstTT.timeSlot - secondTT.timeSlot;
    });

    return sortedByTimeSlot;
  }

}
