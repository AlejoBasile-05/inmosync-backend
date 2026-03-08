import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService
  ) {}
  async create(createPropertyDto: CreatePropertyDto, agent: { id: string , email: string }) {
    if (!agent) {
      throw new Error('Agent ID is required');
    }

    const agentId = agent.id

    const currentAgent = await this.prisma.agent.findUnique({
      where: {
        id: agentId
      }
    })

    if (!currentAgent) {
      throw new Error('Agent not found');
    }

    if (createPropertyDto.price <= 0) {
      throw new Error('Price must be a positive number');
    }

    return await this.prisma.property.create({
      data: {
        company: {
          connect: {
            id: currentAgent.companyId
            }
        },
        status: 'FREE',
        title: createPropertyDto.title,
        type: createPropertyDto.type,
        price: createPropertyDto.price,
        location: createPropertyDto.location,
        beds: createPropertyDto.beds,
        baths: createPropertyDto.baths,
        sqft: createPropertyDto.sqft,
        currency: createPropertyDto.currency,
        characteristics: createPropertyDto.characteristics,
        mainImageUrl: createPropertyDto.mainImageUrl
      }
    })
  }

  async findAll(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: { companyId: true }
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return await this.prisma.property.findMany({
      where: { 
        companyId: agent.companyId 
      }
    });
  }

  async findOne(id: number) {
    return await this.prisma.property.findUnique({
      where: {
        id: id
      }
    });
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return `This action updates a #${id} property`;
  }

  remove(id: number) {
    return `This action removes a #${id} property`;
  }
}
