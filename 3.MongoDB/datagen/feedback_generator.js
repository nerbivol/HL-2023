import { generateNormalDistribution } from "./random.js";

const driverPositiveFeedbacks = [
  "Fast ride",
  "Polite driver",
  "Clean car",
  "Comfortable car",
  "Excellent service",
  "Great communication",
  "Prompt arrival",
];
const driverNegativeFeedbacks = [
  "Late arrival",
  "Rude driver",
  "Dirty car",
  "Uncomfortable ride",
  "Poor service",
  "Unsafe driving",
  "Ignored instructions",
  "Overcharged",
];
const passengerPositiveFeedbacks = [
  "Polite & friendly",
  "Pleasant conversation",
  "Clear instructions",
  "In time for pickup",
  "Clear car",
];
const passengerNegativeFeedbacks = [
  "Late for pickup",
  "Impolite and unfriendly behavior",
  "Messy and dirty in the car",
  "Didn't follow safety guidelines",
  "Provided unclear destination instructions",
  "Disruptive during the ride",
];

function generateRandomRating(skew) {
  const baseRating = Math.random() * skew;
  const rand = generateNormalDistribution(3, 2);
  const skewedRating = Math.abs(rand + baseRating); // Calculate the skewed rating
  return Math.min(5, skewedRating); // Ensure the rating is not greater than 5
}

export function generateFeedback(
  isDriver = true,
  feedbackProbability = 0.5,
  skew = 2
) {
  const rating = generateRandomRating(skew);
  if (Math.random() < 1 - feedbackProbability) {
    return {
      Rating: rating.toFixed(1),
      Notes: [],
    };
  }

  let numFeedbacks;

  if (rating >= 4.5) {
    numFeedbacks = 3;
  } else if (rating >= 3.5 && rating < 4.5) {
    numFeedbacks = 2;
  } else if (rating >= 2.5 && rating < 3.5) {
    numFeedbacks = 1;
  } else if (rating >= 1.5 && rating < 2.5) {
    numFeedbacks = 2;
  } else {
    numFeedbacks = 3;
  }
  const feedbackList =
    rating > 3
      ? isDriver
        ? driverPositiveFeedbacks
        : passengerPositiveFeedbacks
      : isDriver
      ? driverNegativeFeedbacks
      : passengerNegativeFeedbacks;
  const selectedFeedbacks = feedbackList
    .sort(() => 0.5 - Math.random())
    .slice(0, numFeedbacks);

  return {
    Rating: rating.toFixed(1),
    Notes: selectedFeedbacks,
  };
}
