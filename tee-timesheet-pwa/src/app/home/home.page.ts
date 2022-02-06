import { TeeTime } from './../tee-timesheet.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeeTimesheetService } from '../tee-timesheet.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  selectedDate = null;

  teeTimes: Array<TeeTime> = []

  loadingSubscription = new Subscription();
  isSearching = false;

  constructor(
    private teeTimesheetService: TeeTimesheetService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  search(event) {
    this.isSearching = true;
    this.loadingSubscription = this.teeTimesheetService.fetchTeeTimesForDate(this.selectedDate).subscribe(teeTimes => {
      this.teeTimes = teeTimes;
      setTimeout(() => {
        this.isSearching = false;
      }, 1000);
    });

    console.info(">>> this.teeTimes")
    console.info(this.teeTimes)
  }

  async book(selectedTeeTime: TeeTime) {
    console.info(`Selected tee time: ${JSON.stringify(selectedTeeTime)}`);
    const alert = await this.createAlertPrompt(selectedTeeTime)
    await alert.present(); 
  }

  // todo too many overlays are probably causing the bug where the booking is confirmed even when there are validation errors
  async createAlertPrompt(selectedTeeTime) {
    const alert = this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm booking and checkout',
      message: `CAD$ ${selectedTeeTime.price} @ ${selectedTeeTime.date}`,
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        },
        {
          name: 'nOfPlayers',
          type: 'number',
          placeholder: 'Number of Players'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            console.log(data);
            // TODO subscription with loading, then send a toast message
            this.teeTimesheetService.book(selectedTeeTime, +data.nOfPlayers, data.email)
              .then( async () => {
                const confirmAlert = await this.createConfirmAlert('Success', `Check ${data.email} for your booking information`);
                await confirmAlert.present();
              })
              .catch( async (error) => {
                const errorAlert = await this.createConfirmAlert('Error!', `${error}`);
                await errorAlert.present();
              }); 
          }
        }
      ]
    });

    return alert;
  }

  createConfirmAlert(header: string, message: string) {
    return this.alertController.create({
      cssClass: 'my-custom-class',
      header,
      message,
      buttons: ['OK']
    });
  }

}
