export interface CropTask {
  month: string;
  day: number;
  task: string;
  isUrgent?: boolean;
}

export interface CropInfo {
  name: string;
  calendar: CropTask[];
}

export const CROP_DATABASE: Record<string, CropInfo> = {
  'Maïs': {
    name: 'Maïs',
    calendar: [
      { month: 'Mai', day: 15, task: 'Préparation du sol & Fumure', isUrgent: true },
      { month: 'Juin', day: 5, task: 'Semis (après 20mm de pluie)' },
      { month: 'Juillet', day: 15, task: 'Premier sarclage & Buttage' },
      { month: 'Août', day: 10, task: 'Apport d’urée (Stade 8-10 feuilles)' }
    ]
  },
  'Mil': {
    name: 'Mil',
    calendar: [
      { month: 'Mai', day: 22, task: 'Nettoyage des parcelles' },
      { month: 'Juin', day: 12, task: 'Semis direct en poquets' },
      { month: 'Août', day: 5, task: 'Démariage et premier sarclage' }
    ]
  },
  'Arachide': {
    name: 'Arachide',
    calendar: [
      { month: 'Juin', day: 20, task: 'Semis sur sol propre' },
      { month: 'Juillet', day: 10, task: 'Traitement fongicide préventif' },
      { month: 'Octobre', day: 15, task: 'Arrachage & Séchage' }
    ]
  },
  'Riz': {
    name: 'Riz',
    calendar: [
      { month: 'Mai', day: 10, task: 'Préparation de la pépinière' },
      { month: 'Juin', day: 15, task: 'Repiquage en casier' },
      { month: 'Septembre', day: 20, task: 'Gestion de la lame d’eau' }
    ]
  },
  'Gombo': {
    name: 'Gombo',
    calendar: [
      { month: 'Mai', day: 5, task: 'Semis' },
      { month: 'Juin', day: 20, task: 'Paillage pour garder l’humidité' },
      { month: 'Juillet', day: 15, task: 'Récolte des premiers fruits' }
    ]
  }
};

export function getCropCalendar(cropName: string): CropInfo {
  return CROP_DATABASE[cropName] || {
    name: cropName,
    calendar: [
      { month: 'Saison', day: 1, task: 'Consultation expert nécessaire' }
    ]
  };
}
