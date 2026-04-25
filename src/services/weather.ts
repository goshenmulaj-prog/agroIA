export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  forecast: string;
  humidity: number;
  regionCode: string;
  primaryLanguage: 'fr' | 'wo' | 'bm' | 'ha' | 'sw';
}

export const REGIONS: WeatherData[] = [
  { city: "Dakar, Sénégal", temp: 28, condition: "Partiellement nuageux", forecast: "Pas de pluie prévue", humidity: 65, regionCode: "SN", primaryLanguage: 'wo' },
  { city: "Bamako, Mali", temp: 35, condition: "Ensoleillé", forecast: "Vents secs (Harmattan)", humidity: 15, regionCode: "ML", primaryLanguage: 'bm' },
  { city: "Abidjan, Côte d'Ivoire", temp: 30, condition: "Humide", forecast: "Orages isolés ce soir", humidity: 85, regionCode: "CI", primaryLanguage: 'fr' },
  { city: "Ouagadougou, Burkina Faso", temp: 38, condition: "Très chaud", forecast: "Ciel dégagé", humidity: 10, regionCode: "BF", primaryLanguage: 'bm' },
  { city: "Niamey, Niger", temp: 39, condition: "Chaleur intense", forecast: "Ciel clair", humidity: 8, regionCode: "NE", primaryLanguage: 'ha' },
  { city: "Lagos, Nigeria", temp: 31, condition: "Couvert", forecast: "Pluie tropicale", humidity: 90, regionCode: "NG", primaryLanguage: 'ha' }
];

export async function getLocalWeather(cityName?: string): Promise<WeatherData> {
  if (cityName) {
    const found = REGIONS.find(r => r.city === cityName);
    if (found) return found;
  }
  
  const selected = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  return new Promise((resolve) => {
    setTimeout(() => resolve(selected), 600);
  });
}
