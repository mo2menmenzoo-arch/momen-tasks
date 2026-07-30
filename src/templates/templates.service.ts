import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { TemplateQueryDto } from "./dto/template-query.dto";
import { ApplyTemplateDto } from "./dto/apply-template.dto";
import { TemplateEntity } from "./entities/template.entity";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    query: TemplateQueryDto,
  ): Promise<TemplateEntity[]> {
    const where: any = {
      OR: [
        { authorId: userId },
        ...(query.includePublic ? [{ isPublic: true, isModerated: true }] : []),
      ],
    };

    if (query.search) {
      where.OR = [
        ...where.OR,
        {
          AND: [
            { isPublic: true, isModerated: true },
            {
              OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                {
                  description: { contains: query.search, mode: "insensitive" },
                },
              ],
            },
          ],
        },
      ];
    }

    const templates = await this.prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return templates.map(TemplateEntity.fromTemplate);
  }

  async findOne(userId: string, templateId: string): Promise<TemplateEntity> {
    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        OR: [{ authorId: userId }, { isPublic: true, isModerated: true }],
      },
    });

    if (!template) {
      throw new NotFoundException("Template not found");
    }

    return TemplateEntity.fromTemplate(template);
  }

  async create(
    userId: string,
    createTemplateDto: CreateTemplateDto,
  ): Promise<TemplateEntity> {
    const template = await this.prisma.template.create({
      data: {
        title: createTemplateDto.title,
        description: createTemplateDto.description,
        taskBlueprint: createTemplateDto.taskBlueprint as any,
        isPublic: createTemplateDto.isPublic,
        authorId: userId,
      },
    });

    return TemplateEntity.fromTemplate(template);
  }

  async update(
    userId: string,
    templateId: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<TemplateEntity> {
    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        authorId: userId,
      },
    });

    if (!template) {
      throw new NotFoundException(
        "Template not found or you do not have permission to edit it",
      );
    }

    const updatedTemplate = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        ...(updateTemplateDto.title !== undefined && {
          title: updateTemplateDto.title,
        }),
        ...(updateTemplateDto.description !== undefined && {
          description: updateTemplateDto.description,
        }),
        ...(updateTemplateDto.taskBlueprint !== undefined && {
          taskBlueprint: updateTemplateDto.taskBlueprint as any,
        }),
        ...(updateTemplateDto.isPublic !== undefined && {
          isPublic: updateTemplateDto.isPublic,
        }),
      },
    });

    return TemplateEntity.fromTemplate(updatedTemplate);
  }

  async remove(
    userId: string,
    templateId: string,
  ): Promise<{ message: string }> {
    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        authorId: userId,
      },
    });

    if (!template) {
      throw new NotFoundException(
        "Template not found or you do not have permission to delete it",
      );
    }

    await this.prisma.template.delete({
      where: { id: templateId },
    });

    return { message: "Template deleted successfully" };
  }

  async apply(
    userId: string,
    templateId: string,
    applyTemplateDto: ApplyTemplateDto,
  ): Promise<{ message: string; taskIds: string[] }> {
    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        OR: [{ authorId: userId }, { isPublic: true, isModerated: true }],
      },
    });

    if (!template) {
      throw new NotFoundException("Template not found");
    }

    const blueprint = template.taskBlueprint as any;
    const taskIds: string[] = [];

    if (blueprint.tasks && Array.isArray(blueprint.tasks)) {
      for (const taskData of blueprint.tasks) {
        const title = applyTemplateDto.prefix
          ? `${applyTemplateDto.prefix} ${taskData.title}`
          : taskData.title;

        const task = await this.prisma.task.create({
          data: {
            title,
            notes: taskData.notes,
            priority: taskData.priority || "MEDIUM",
            zoneId: applyTemplateDto.zoneId,
            ownerId: userId,
            source: "TEMPLATE",
            tags: taskData.tags || [],
            estimatedEffortMinutes: taskData.estimatedEffortMinutes,
          },
        });

        taskIds.push(task.id);

        if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
          for (const subtaskData of taskData.subtasks) {
            const subtask = await this.prisma.task.create({
              data: {
                title: subtaskData.title,
                notes: subtaskData.notes,
                priority: subtaskData.priority || "MEDIUM",
                zoneId: applyTemplateDto.zoneId,
                ownerId: userId,
                parentTaskId: task.id,
                source: "TEMPLATE",
                tags: subtaskData.tags || [],
              },
            });
            taskIds.push(subtask.id);
          }
        }
      }
    }

    await this.prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    return {
      message: `Template applied successfully. Created ${taskIds.length} tasks.`,
      taskIds,
    };
  }
}
