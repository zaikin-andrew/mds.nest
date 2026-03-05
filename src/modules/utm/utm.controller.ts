import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UtmService } from './utm.service';
import { CreateUtmDto } from './dto/create-utm.dto';
import { UpdateUtmDto } from './dto/update-utm.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('utm')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('utm')
export class UtmController {
  constructor(private readonly utmService: UtmService) {}

  @Post()
  @ApiOperation({ summary: 'Create a UTM entry' })
  create(@Body() createUtmDto: CreateUtmDto) {
    return this.utmService.create(createUtmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UTM entries' })
  findAll() {
    return this.utmService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a UTM entry by id' })
  findOne(@Param('id') id: string) {
    return this.utmService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a UTM entry' })
  update(@Param('id') id: string, @Body() updateUtmDto: UpdateUtmDto) {
    return this.utmService.update(+id, updateUtmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a UTM entry' })
  remove(@Param('id') id: string) {
    return this.utmService.remove(+id);
  }
}
