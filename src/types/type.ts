export interface User {
    executive_id: number,
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
  sequenceId: number;
  arrivalTime: string;
  departureTime: string;
  distance_from_start: number; 
}

export interface RouteLandmark {
  id: number;
  landmark_id: string;
  name: string;
  arrival_time: string;
  departure_time: string;
  distance_from_start?: number;
  sequence_id?: number;
}




