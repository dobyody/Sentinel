import mockHazardsJson from './mockHazards.json';

export interface HazardReport {
  id: number;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const MOCK_HAZARDS: HazardReport[] = mockHazardsJson as HazardReport[];
