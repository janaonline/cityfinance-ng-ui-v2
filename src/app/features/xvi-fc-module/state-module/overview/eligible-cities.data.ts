export interface StateCityEntry {
  state: string;
  abbreviation: string;
  cities: string[];
}

export const ELIGIBLE_CITIES_DATA: StateCityEntry[] = [
  { state: 'Andhra Pradesh', abbreviation: 'AP', cities: ['Visakhapatnam', 'Vijayawada'] },
  { state: 'Bihar', abbreviation: 'BR', cities: ['Patna'] },
  { state: 'Chhattisgarh', abbreviation: 'CG', cities: ['Raipur'] },
  { state: 'Gujarat', abbreviation: 'GJ', cities: ['Vadodara', 'Rajkot'] },
  { state: 'Haryana', abbreviation: 'HR', cities: ['Faridabad'] },
  { state: 'Jharkhand', abbreviation: 'JH', cities: ['Dhanbad', 'Ranchi'] },
  { state: 'Madhya Pradesh', abbreviation: 'MP', cities: ['Indore', 'Bhopal'] },
  { state: 'Maharashtra', abbreviation: 'MH', cities: ['Pune', 'Nagpur'] },
  { state: 'Punjab', abbreviation: 'PB', cities: ['Ludhiana', 'Amritsar'] },
  { state: 'Rajasthan', abbreviation: 'RJ', cities: ['Jaipur', 'Jodhpur'] },
  { state: 'Tamil Nadu', abbreviation: 'TN', cities: ['Coimbatore', 'Madurai'] },
  { state: 'Uttar Pradesh', abbreviation: 'UP', cities: ['Lucknow', 'Kanpur'] },
  { state: 'West Bengal', abbreviation: 'WB', cities: ['Howrah'] },
];

export function getEligibleCitiesLabel(stateName: string): string | null {
  const entry = ELIGIBLE_CITIES_DATA.find(
    (e) => e.state.toLowerCase() === stateName.toLowerCase(),
  );
  if (!entry || entry.cities.length === 0) return null;
  return `Eligible cities in ${entry.abbreviation}: ${entry.cities.join(', ')}`;
}
