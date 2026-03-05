import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppVersionService } from './app-version.service';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('app-version')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('app-version')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Post()
  @ApiOperation({ summary: 'Create an app version entry' })
  create(@Body() createAppVersionDto: CreateAppVersionDto) {
    return this.appVersionService.create(createAppVersionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all app version entries' })
  findAll() {
    return this.appVersionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an app version entry by id' })
  findOne(@Param('id') id: string) {
    return this.appVersionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an app version entry' })
  update(@Param('id') id: string, @Body() updateAppVersionDto: UpdateAppVersionDto) {
    return this.appVersionService.update(+id, updateAppVersionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an app version entry' })
  remove(@Param('id') id: string) {
    return this.appVersionService.remove(+id);
  }
}
