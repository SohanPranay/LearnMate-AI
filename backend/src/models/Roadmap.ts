export interface RoadmapStep {
  title: string;
  completed: boolean;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  steps: RoadmapStep[];
  updatedAt: Date;
}
