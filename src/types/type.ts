export interface User {
  executive_id: number;
}

export interface Account {
  id: number;
  fullName: string;
  username: string;
  password?: string;
  gender: string;
  designation: string;
  email: string;
  phoneNumber: string;
  status: string;
}

export interface Landmark {
  id: number;
  name: string;
  boundary: string;
  status: string;
  importance: string;
}

export interface BusStop {
  id: number;
  name: string;
  landmark_id: number;
  location: string;
  status: string;
  parsedLocation?: [number, number] | null;
}

export interface SelectedLandmark {
  id: number;
  name: string;
  sequenceId?: number;
  starting_time: string;
  arrivalTime: string;
  departureTime: string;
  arrivalDelta: number;
  departureDelta: number;
  distance_from_start: number;
}

export interface RouteLandmark {
  id: number;
  landmark_id: string;
  name: string;
  starting_time: string;
  arrival_delta: string;
  departure_delta: string;
  
  arrivalTime: string;
  departureTime: string;
  distance_from_start?: number;
  sequence_id?: number;
}
