import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtpaskR40XPJatSBwaqBiCXUhTf6J_Iio",
  authDomain: "h-startup-app.firebaseapp.com",
  projectId: "h-startup-app",
  storageBucket: "h-startup-app.appspot.com",
  messagingSenderId: "1053759972372",
  appId: "1:1053759972372:web:a54b7ac403e3be9e8f3301",
  measurementId: "G-G622FVDMB8",
};
// The Firebase Admin SDK to access Firestore.

const app = admin.initializeApp(firebaseConfig);

export const scheduledPriceComputations = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  console.log('This will be run every 5 minutes and should compute the prices for the day (maybe for future dates too?)!');
  return null;
});


function getServerTimestamp() {
  return firestore.FieldValue.serverTimestamp();
}

//
export const helloWorld = functions.https.onRequest( async (request, response) => {
  try {

    const requestParams = request.params;
    const params = { email: request.params.email, name: request.params.name }

    functions.logger.log(`Params ${JSON.stringify(params)}`);
    const newUser = await admin.auth().createUser({
      email: params.email,
      emailVerified: false,
      displayName: params.name,
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false
    });

    functions.logger.log(`newUser ${JSON.stringify(newUser)}`);

    const newProfile = {
      userId: newUser.uid,
      name: request.params.name ? request.params.name : 'NoName',
      email: request.params.email,
      createdAt: getServerTimestamp(), 
      updatedAt: getServerTimestamp(), 
    };

    functions.logger.log(`newProfile ${JSON.stringify(newProfile)}`);

    app.firestore().collection('profiles').add(newProfile);


    // functions.logger.info(`Hello ${requestParams.name}`, {structuredData: true});
    response.json({
      message: `Hello, ${requestParams.name} (IP:${request.ip})`,
      newProfile,
      newUser,
      paramsEcho: params
    });


  } catch(error) {
    functions.logger.error(`Error ${JSON.stringify(error)}`);
  }

});

// [START helloWorld]
/**
 * Cloud Function to be triggered by Pub/Sub that logs a message using the data published to the
 * topic.
 */
// [START trigger]
// export const helloPubSub = functions.pubsub.topic('topic-name').onPublish((message) => {
//     // [END trigger]
//       // [START readBase64]
//       // Decode the PubSub Message body.
//       const messageBody = message.data ? Buffer.from(message.data, 'base64').toString() : null;
//       // [END readBase64]
//       // Print the message in the logs.
//       functions.logger.log(`Hello ${messageBody || 'World'}!`);
//       return null;
//     });
    // [END helloWorld]
    
    // /**
    //  * Cloud Function to be triggered by Pub/Sub that logs a message using the data published to the
    //  * topic as JSON.
    //  */
    // exports.helloPubSubJson = functions.pubsub.topic('another-topic-name').onPublish((message) => {
    //   // [START readJson]
    //   // Get the `name` attribute of the PubSub message JSON body.
    //   let name = null;
    //   try {
    //     name = message.json.name;
    //   } catch (e) {
    //     functions.logger.error('PubSub message was not JSON', e);
    //   }
    //   // [END readJson]
    //   // Print the message in the logs.
    //   functions.logger.log(`Hello ${name || 'World'}!`);
    //   return null;
    // });
    
    // /**
    //  * Cloud Function to be triggered by Pub/Sub that logs a message using the data attributes
    //  * published to the topic.
    //  */
    // exports.helloPubSubAttributes = functions.pubsub.topic('yet-another-topic-name').onPublish((message) => {
    //   // [START readAttributes]
    //   // Get the `name` attribute of the message.
    //   const name = message.attributes.name;
    //   // [END readAttributes]
    //   // Print the message in the logs.
    //   functions.logger.log(`Hello ${name || 'World'}!`);
    //   return null;
    // });