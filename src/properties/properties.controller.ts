import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Query } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/GetUser';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Controller('properties')
@UseGuards(AuthGuard('jwt'))
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('/create')
  create(@GetUser() agent: { id: string, email: string }, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto, agent);
  }

  @Get('/allProperties')
  findAll(@Query('status') status: "FREE" | "BUSY") {
    return this.propertiesService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(+id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(+id);
  }
}
