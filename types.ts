
import { ReactNode } from 'react';

export interface ServiceItem {
  icon: ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'indigo';
}

export interface CaseStudyItem {
  icon: ReactNode;
  client: string;
  segment: string;
  challenge: string;
  solution: string;
  results: string[];
  color: 'orange' | 'green' | 'blue';
}

export interface PortfolioReport {
  title: string;
  desc: string;
  link: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
