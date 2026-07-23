export interface TaskBlueprint {
  title: string;
  priority?: string;
  tags?: string[];
  estimatedEffortMinutes?: number;
}

export interface Template {
  id: string;
  authorId: string;
  title: string;
  description: string | null;
  taskBlueprint: { tasks: TaskBlueprint[] };
  isPublic: boolean;
  isModerated: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyTemplateInput {
  zoneId: string;
  prefix?: string;
}
