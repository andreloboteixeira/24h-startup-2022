import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
const axios = require('axios');

const firebaseConfig = {
  apiKey: "AIzaSyCtpaskR40XPJatSBwaqBiCXUhTf6J_Iio",
  authDomain: "h-startup-app.firebaseapp.com",
  projectId: "h-startup-app",
  storageBucket: "h-startup-app.appspot.com",
  messagingSenderId: "1053759972372",
  appId: "1:1053759972372:web:a54b7ac403e3be9e8f3301",
  measurementId: "G-G622FVDMB8",
};
const app = admin.initializeApp(firebaseConfig);
const firestoreDb = app.firestore();
const dbCollections = { weatherData: 'weather-data', teeTimes: 'tee-times'};

interface TeeTime {
  id: string,
  price: number,
  date: Date,
  timeSlot: number,
  numberOfPlayers: number,
  booked: boolean,
  bookedBy: string,
	isGoodWeather: boolean,
	maxWeatherAdjustedPrice: number,
	teeTimesInventory: number;
	previousPrice: number;
}

export const scheduledPriceComputations = functions.pubsub.schedule('every 1 minutes').onRun( async (context) => {

	console.info('This will be run every 5 minutes and should update the prices for the day !');
	try {
		const openWeatherAPIKey = functions.config().openweather.key
		const rreginaGolfClubLocation = {lat: 50, long: -104};
		
		const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${rreginaGolfClubLocation.lat}&lon=${rreginaGolfClubLocation.long}&appid=${openWeatherAPIKey}`);
		const weatherData = res.data;

		const isGoodWeather = checkIfItIsGoodWeather(weatherData);// store weather data
		await firestoreDb.collection(dbCollections.weatherData).add({data: weatherData, isGoodWeather, location: rreginaGolfClubLocation, createdAt: getServerTimestamp()});


		// const today = getServerTimestamp();
		const todaysTeeTimesDocs = await firestoreDb.collection(dbCollections.teeTimes).get(); // TODO fetch teeTimes for today

		const todaysTeeTimes = teeTimeConversion(todaysTeeTimesDocs.docs.map(doc => doc.data()));
		const maxPrice = 90; // dollars, cents is in the database
		const minPrice = 10;

		const updatedTodaysTeeTimesWeather = todaysTeeTimes.map(teeTime => {
			return {...teeTime, isGoodWeather};
		});

		const updatedTodaysTeeTimesWeatherAdjustedPrice = updatedTodaysTeeTimesWeather.map(teeTime => {
			return {...teeTime, maxWeatherAdjustedPrice: computeMaxWeatherAdjustedPrice(teeTime, maxPrice)};
		});

		const updatedTodaysTeeTimesInventory = updatedTodaysTeeTimesWeatherAdjustedPrice.map(teeTime => {
			return {...teeTime, teeTimesInventory: computeTeeTimeInventory(updatedTodaysTeeTimesWeatherAdjustedPrice, teeTime)};
		});

		
		const updatedTodaysTeeTimesPrices = updatedTodaysTeeTimesInventory.map(teeTime => {
			return {...teeTime, previousPrice: teeTime.price * 100, price: teeTime.booked ? teeTime.price * 100 : computePriceToDisplay(minPrice, teeTime)};
		});
		
		updatedTodaysTeeTimesPrices.forEach(async (ttToUpdate) => {
			await firestoreDb.collection(dbCollections.teeTimes).doc(ttToUpdate.id).set(ttToUpdate, {merge: true});
		})

		return null;
	} catch(schedulerError) {
		console.error(schedulerError);
		return schedulerError;
	}
});

function computeMaxWeatherAdjustedPrice(teeTime: TeeTime, max: number) {
	if (teeTime.isGoodWeather) {
		return max * 1.4;
	} else {
		return max * 0.6;
	}
}

function computeTeeTimeInventory(teeTimes: Array<TeeTime>, currTeeTime: TeeTime, window?: {initIdx: number, endIdx: number}) {
	let windowToAnalyze = 3 // TODO: starting with 3 hours for periods of 10min, have to first change the database with 10 min timeslots

	const teeTimeToCompute = teeTimes.find(tt => tt.id == currTeeTime.id);
	if (!teeTimeToCompute) {
		throw Error("teeTimeNotFound")
	}
	const idx = teeTimes.indexOf(teeTimeToCompute);
	
	if (idx + windowToAnalyze < teeTimes.length) {
		const toAnalize = teeTimes.splice(idx, windowToAnalyze);

		let total = 0;
		toAnalize.forEach(tttime => {
			if (tttime.booked) {
				total += 1;
			}
		})

		return total/windowToAnalyze;

	} else { // dealing with cases where window would exceed array limit
		const remainingWindow = teeTimes.length - idx;
		const toAnalize = teeTimes.splice(idx, remainingWindow);

		let total = 0;
		toAnalize.forEach(tttime => {
			if (tttime.booked) {
				total += 1;
			}
		})

		return total/remainingWindow;
	}

}

function computePriceToDisplay(min: number, teeTime: TeeTime) {
	return (min + (teeTime.maxWeatherAdjustedPrice * teeTime.teeTimesInventory))*100;
}

function checkIfItIsGoodWeather(weatherData: any) {
	const minTemp = 283.15; // K , 10 C
	const maxTemp = 303.15; // K, 30 C
	const maxWind = 13.4112; // m/s
	let isGood = false;
	
	// temperature
	if (weatherData.main.temp < minTemp  || weatherData.main.temp > maxTemp) {
		isGood = false
	} else {
		// wind
		if (weatherData.wind.speed > maxWind) {
			isGood = false
		} else {
			isGood = true
		}
	}

	return isGood;
}

function teeTimeConversion(teeTimes: Array<any>) {
  
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

function getServerTimestamp() {
  return firestore.FieldValue.serverTimestamp();
}