export type SimulationStatus = 'Running' | 'Paused' | 'Review Required' | 'Completed';
export type Category = 'Health' | 'Education' | 'Environment' | 'Poverty Alleviation' | 'Logistics' | 'FinTech';
export type Difficulty = 1 | 2 | 3;

export interface Simulation {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  status?: SimulationStatus;
  progress?: number;
  image: string;
  impactPotential?: number;
  complexity?: string;
  timeEstimate?: string;
}

export interface Metric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
}

export interface StakeholderFeedback {
  id: string;
  name: string;
  role: string;
  avatar: string;
  message: string;
}
