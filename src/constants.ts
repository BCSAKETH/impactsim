import { Simulation, StakeholderFeedback } from "./types";

export const SIMULATIONS: Simulation[] = [
  {
    id: 'urban-literacy',
    title: 'Urban Literacy Initiative',
    description: 'Phase 3: Scaling Educational Infrastructure in Sub-Saharan Metropolitan Zones. You have 4 pending decisions.',
    category: 'Education',
    difficulty: 2,
    status: 'Running',
    progress: 75,
    image: 'https://picsum.photos/seed/education/800/400',
    impactPotential: 8.5,
    complexity: 'Moderate',
    timeEstimate: '30 Mins'
  },
  {
    id: 'clean-water-mumbai',
    title: 'Clean Water Access: Mumbai',
    description: 'Deploying sustainable filtration systems in high-density informal settlements.',
    category: 'Environment',
    difficulty: 3,
    status: 'Review Required',
    progress: 65,
    image: 'https://picsum.photos/seed/water/800/400',
    impactPotential: 9.2,
    complexity: 'Advanced',
    timeEstimate: '45 Mins'
  },
  {
    id: 'micro-finance-mesh',
    title: 'Micro-Finance Mesh Network',
    description: 'Establishing peer-to-peer lending circles using blockchain-based social tokens.',
    category: 'FinTech',
    difficulty: 2,
    status: 'Running',
    progress: 32,
    image: 'https://picsum.photos/seed/finance/800/400',
    impactPotential: 7.8,
    complexity: 'Moderate',
    timeEstimate: '25 Mins'
  },
  {
    id: 'green-supply-chain',
    title: 'Green Supply Chain Optimizer',
    description: 'Reducing carbon footprint in last-mile delivery for rural agricultural cooperatives.',
    category: 'Logistics',
    difficulty: 3,
    status: 'Paused',
    progress: 90,
    image: 'https://picsum.photos/seed/logistics/800/400',
    impactPotential: 8.9,
    complexity: 'Advanced',
    timeEstimate: '40 Mins'
  },
  {
    id: 'mental-health-outreach',
    title: 'Mental Health Outreach',
    description: 'Deploy a mobile counseling network across urban centers to reduce crisis intervention costs.',
    category: 'Health',
    difficulty: 2,
    image: 'https://picsum.photos/seed/health/800/400',
    impactPotential: 8.2,
    complexity: 'Moderate',
    timeEstimate: '35 Mins'
  }
];

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
