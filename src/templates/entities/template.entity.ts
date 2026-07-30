import { Template } from "@prisma/client";

export class TemplateEntity {
  id: string;
  authorId: string | null;
  title: string;
  description: string | null;
  taskBlueprint: Record<string, unknown>;
  isPublic: boolean;
  isModerated: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;

  static fromTemplate(template: Template): TemplateEntity {
    return {
      id: template.id,
      authorId: template.authorId,
      title: template.title,
      description: template.description,
      taskBlueprint: template.taskBlueprint as Record<string, unknown>,
      isPublic: template.isPublic,
      isModerated: template.isModerated,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
