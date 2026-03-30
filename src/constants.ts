import { Simulation, StakeholderFeedback } from "./types";

export const SIMULATIONS: Simulation[] = [];

export const FEEDBACK: StakeholderFeedback[] = [
  {
    id: '1',
    name: 'Dr. Aris Thorne',
    role: 'Local Clinic Lead',
    avatar: 'https://i.pravatar.cc/150?u=aris',
    message: '"The clinical team is ready, but the idle time is hurting morale. We need a surge in outreach within 48 hours."'
  },
  {
    id: '2',
    name: 'Mrs. Gable',
    role: 'Town Council Member',
    avatar: 'https://i.pravatar.cc/150?u=gable',
    message: '"People here don\'t like to talk about their problems with strangers. You have to earn the right to listen."'
  }
];
