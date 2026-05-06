export interface College {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewsCount: number;
  estYear: number;
  type: 'Public' | 'Private';
  logo: string;
  image: string;
  fees: {
    min: number;
    max: number;
    average: number;
  };
  courses: string[];
  facilities: string[];
  description: string;
  rankings: {
    nirf?: number;
    nirfCategory?: string;
    times?: number;
    global?: number;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

export interface BookmarkState {
  collegeIds: string[];
}

export interface CompareState {
  collegeIds: string[];
}
