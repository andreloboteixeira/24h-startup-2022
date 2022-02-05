import { TeeTime } from './../tee-timesheet.service';
import { Component, OnInit } from '@angular/core';
import { TeeTimesheetService } from '../tee-timesheet.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  selectedDate = null;

  teeTimes: Array<TeeTime> = []

  constructor(
    private teeTimesheetService: TeeTimesheetService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    
  }

  search(event) {
    console.info(`Event: ${JSON.stringify(event)}, selectedate: ${this.selectedDate}`);
    
    this.teeTimes = this.teeTimesheetService.fetchTeeTimesForDate(this.selectedDate);
    console.info(">>> this.teeTimes")
    console.info(this.teeTimes)
  }

  async book(selectedTeeTime: TeeTime) {
    console.info(`Selected tee time: ${JSON.stringify(selectedTeeTime)}`);
    this.teeTimesheetService.book(selectedTeeTime);
    
    const alert = await this.alertController.create({
      header: 'Confirm and checkout',
      message: `CAD$ ${selectedTeeTime.price} @ ${selectedTeeTime.date}`,
      // inputs: [ { name: 'email', type: 'text', placeholder: 'Email'}],
      buttons: ['Cancel', 'Checkout'],
    });

    await alert.present()
    
  }

}
