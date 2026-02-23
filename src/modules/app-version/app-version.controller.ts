import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';

@Controller('app-version')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Post()
  create(@Body() createAppVersionDto: CreateAppVersionDto) {
    return this.appVersionService.create(createAppVersionDto);
  }

  @Get()
  findAll() {
    return this.appVersionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appVersionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppVersionDto: UpdateAppVersionDto) {
    return this.appVersionService.update(+id, updateAppVersionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appVersionService.remove(+id);
  }
}
