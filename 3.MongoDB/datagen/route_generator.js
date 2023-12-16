export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function calculateTimeToReachDestination(distance, speed) {
  // Calculate time (in hours) to reach the destination at the given speed
  const timeInHours = distance / speed;
  return timeInHours * 60 * 60 * 1000; // Convert hours to milliseconds
}

export function generateRoute(
  startDateTime,
  startLat,
  startLon,
  endLat,
  endLon,
  intervalSeconds,
  speed
) {
  const route = [];

  const endDateTime = new Date(
    startDateTime.getTime() +
      calculateTimeToReachDestination(
        calculateDistance(startLat, startLon, endLat, endLon),
        speed
      )
  );

  let currentTime = startDateTime.getTime();

  while (currentTime < endDateTime.getTime()) {
    // Calculate intermediate point based on elapsed time
    const progress =
      (currentTime - startDateTime.getTime()) /
      (endDateTime.getTime() - startDateTime.getTime());
    const intermediateLat = startLat + progress * (endLat - startLat);
    const intermediateLon = startLon + progress * (endLon - startLon);

    route.push({
      Location: {
        type: "Point",
        coordinates: [intermediateLon, intermediateLat],
      },
      DateTime: new Date(currentTime),
    });

    // Move time forward by the discrete update interval
    currentTime += intervalSeconds * 1000;
  }

  route[route.length - 1].Location.coordinates = [endLon, endLat];
  return route;
}

// Example usage:
// const startLocation = { latitude: 51.401546, longitude: 0.015415 };
// const endLocation = { latitude: 51.396361, longitude: -0.048051 };
// const speed = 50; // Speed in km/h
// const intervalSeconds = 5;

// const movements = generateRoute(
//   new Date(),
//   startLocation.latitude,
//   startLocation.longitude,
//   endLocation.latitude,
//   endLocation.longitude,
//   intervalSeconds,
//   speed
// );

// console.log(movements);
