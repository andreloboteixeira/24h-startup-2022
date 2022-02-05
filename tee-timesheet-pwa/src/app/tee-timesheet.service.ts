import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TeeTime {
  price: number,
  date: Date,
  timeSlot: number
}

@Injectable({
  providedIn: 'root'
})
export class TeeTimesheetService {

  teeTimes: Array<TeeTime>;

  mockTeeTimes: Array<TeeTime> = this.createMock();

  constructor(
    private afs: AngularFirestore
  ) { }

  fetchTeeTimesForDate(date: Date): Observable<Array<TeeTime>> { // TODO fetch by day
    console.info(`Fetching tee times for ${date}`)

    const teeTimes$ = this.afs.collection<TeeTime>('tee-times').valueChanges().pipe(
      map(teeTimes => {
        return this.teeTimeConversion(teeTimes);
      })
    );
    
    return teeTimes$;
  }

  book(teeTime: TeeTime, numberOfPlayers: number, email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log({teeTime, numberOfPlayers, email})
      if (!numberOfPlayers || numberOfPlayers > 10) {
        reject("Invalid number of players, no more than 10");
      }
      
      if (!email || email.trim().length < 1) {
        reject("Invalid email");
      }
      // TODO use angular fire
      // TODO update flag in teeTime "booked"
      // TODO update and the number of people 
      // TODO send a confirmation email
      resolve();
    });
  }

  teeTimeConversion(teeTimes: Array<any>) {
  
    const dateConverted = teeTimes.map((tt: any) => {
      return { 
        date: tt.date.toDate(),
        price: tt.price/100,
        timeSlot: tt.timeSlot
      }
    }) as Array<TeeTime>;

    function sortByTimeSlot(firstEl: number, secondEl: number) {
      return firstEl < secondEl;
    }

    const sortedByTimeSlot = dateConverted.sort((firstTT, secondTT) => {
      return firstTT.timeSlot - secondTT.timeSlot;
    });

    return sortedByTimeSlot;
  }

  createMock() {
    return [
      {date: new Date(), price: 10, timeSlot: 0},
      {date: new Date(), price: 20, timeSlot: 1}, 
      {date: new Date(), price: 40, timeSlot: 2},
      {date: new Date(), price: 25, timeSlot: 3},
      {date: new Date(), price: 25, timeSlot: 4},
      {date: new Date(), price: 50, timeSlot: 5},
      {date: new Date(), price: 50, timeSlot: 6},
      {date: new Date(), price: 50, timeSlot: 7},
      {date: new Date(), price: 25, timeSlot: 8},
      {date: new Date(), price: 40, timeSlot: 9},
      {date: new Date(), price: 40, timeSlot: 10},
      {date: new Date(), price: 45, timeSlot: 11},
      {date: new Date(), price: 45, timeSlot: 12},
      {date: new Date(), price: 50, timeSlot: 13},
      {date: new Date(), price: 60, timeSlot: 14},
      {date: new Date(), price: 60, timeSlot: 15},
      {date: new Date(), price: 70, timeSlot: 16},
      {date: new Date(), price: 80, timeSlot: 17},
      {date: new Date(), price: 90, timeSlot: 18},
      {date: new Date(), price: 30, timeSlot: 19},
      {date: new Date(), price: 30, timeSlot: 20},
      {date: new Date(), price: 10, timeSlot: 21},
      {date: new Date(), price: 10, timeSlot: 22},
      {date: new Date(), price: 10, timeSlot: 23}
    ];
  }

}
