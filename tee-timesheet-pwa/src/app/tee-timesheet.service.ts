
import { Injectable } from '@angular/core';

export interface TeeTime {
  price: number,
  date: Date,
  timeSlot: number
}

@Injectable({
  providedIn: 'root'
})
export class TeeTimesheetService {

  mockTeeTimes: Array<TeeTime> = [
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

  constructor() { }

  fetchTeeTimesForDate(date: Date): Array<TeeTime> {
    console.info(`Fetching tee times for ${date}`)

    // TODO: use angular fire

    return this.mockTeeTimes;
  }

  book(teeTime: TeeTime) {
    // TODO: use angular fire
    return ;
  }

}
