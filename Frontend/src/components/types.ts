import { ReactElement } from 'react';

//landing page

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  initial: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface HOW {
  icon: ReactElement;
  title: string;
  description: string;
}

export interface Team {
  name: string;
  studentId: string;
  role: string;
  githubUrl: string;
  email: string;
  imageUrl: string;
}

export type DormType = {
  id: string;
  title: string;
  image: string;
  description: string;
  price: number;
  building: 'new' | 'old';
  features?: string[];
  amenities?: string[];
};

//end of landing page


// register and login

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmedPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  telephone: string;
}

export interface LoginData {
  userIdentifier: string;
  password: string;
}

// end of register and log-in