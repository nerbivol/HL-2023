import { MongoClient } from "mongodb";
import { generateRoute, calculateDistance } from "./route_generator.js";
import { generateNormalDistribution } from "./random.js";
import { generateFeedback } from "./feedback_generator.js";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// true if write to DB
// false if write to console
const dbWriteMode = true;
const debug = false;

const documentsToCreate = 200000;
const batchSize = 1000;

const drivers = 2000;
const driverFeedbackProb = 0.7;
const passengers = 8000;
const passengerFeedbackProb = 0.4;

const discreteTimeSeconds = 5;
const taxiAvgSpeed = 30;
const minDistance = 0.5;

const meanHour = 18;
const stdDevHour = 6;

function generateRandomDateTime(meanHour, stdDevHour) {
  const randomHour = generateNormalDistribution(meanHour % 24, stdDevHour) % 24;
  const randomMinutes = Math.floor(Math.random() * 60);
  const randomSeconds = Math.floor(Math.random() * 60);

  const dateTime = new Date();
  dateTime.setHours(Math.floor(randomHour));
  dateTime.setMinutes(randomMinutes);
  dateTime.setSeconds(randomSeconds);

  return dateTime;
}

async function main() {
  try {
    const db = client.db("londondb");
    const postcodes = db.collection("postcodes");
    const orders = db.collection("orders");

    for (var i = 0; i < documentsToCreate / batchSize; i++) {
      console.log("creating batch " + i);
      // select two random documents, get data
      var readDocuments = await postcodes
        .aggregate([{ $sample: { size: 2 * batchSize } }])
        .project({ Postcode: 1, Latitude: 1, Longitude: 1, District: 1 })
        .toArray();

      var writeDocuments = [];
      for (var j = 0; j < batchSize; j++) {
        var startPoint = readDocuments[j];
        var endPoint = readDocuments[batchSize + j];
        var distance = calculateDistance(
          startPoint.Latitude,
          startPoint.Longitude,
          endPoint.Latitude,
          endPoint.Longitude
        );

        // if distance is less than permitted, resample
        while (distance < minDistance) {
          var index;
          do {
            index = Math.floor(Math.random() * readDocuments.length);
          } while (index == j);
          endPoint = readDocuments[index];
          distance = calculateDistance(
            startPoint.Latitude,
            startPoint.Longitude,
            endPoint.Latitude,
            endPoint.Longitude
          );
          if (debug)
            console.log(
              `Resampled j=${j} to index=${index}, distance=${distance}`
            );
        }

        // get driver
        var driverId = Math.floor(Math.random() * drivers);
        var driverFeedback = generateFeedback(true, driverFeedbackProb);
        // get passenger
        var passengerId = Math.floor(Math.random() * passengers);
        var passengerFeedback = generateFeedback(false, passengerFeedbackProb);
        // get time of ride
        var time = generateRandomDateTime(meanHour, stdDevHour);
        // get route
        var route = generateRoute(
          time,
          startPoint.Latitude,
          startPoint.Longitude,
          endPoint.Latitude,
          endPoint.Longitude,
          discreteTimeSeconds,
          taxiAvgSpeed
        );

        // get duration
        var duration =
          (route[route.length - 1].DateTime - route[0].DateTime) / 1000; // in seconds
        // get price
        var price = duration * 0.02;

        // compose document
        var result = {
          Driver: {
            Id: driverId,
            Feedback: driverFeedback,
          },
          Passenger: {
            Id: passengerId,
            Feedback: passengerFeedback,
          },
          Departure: {
            Location: {
              type: "Point",
              coordinates: [startPoint.Longitude, startPoint.Latitude],
            },
            Timestamp: route[0].DateTime,
          },
          Destination: {
            Location: {
              type: "Point",
              coordinates: [endPoint.Longitude, endPoint.Latitude],
            },
            Timestamp: route[route.length - 1].DateTime,
          },
          Distance: distance,
          Duration: duration,
          Price: price.toFixed(2),
          Route: route,
        };

        writeDocuments.push(result);
        if (!dbWriteMode) {
          console.log(result);
        }
      }

      if (dbWriteMode) {
        await orders.insertMany(writeDocuments);
      }
    }
  } finally {
    await client.close();
  }
}

main();
