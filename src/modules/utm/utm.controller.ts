import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UtmService } from './utm.service';
import { CreateUtmDto } from './dto/create-utm.dto';
import { UpdateUtmDto } from './dto/update-utm.dto';

@Controller('utm')
export class UtmController {
  constructor(private readonly utmService: UtmService) {}

  @Post()
  create(@Body() createUtmDto: CreateUtmDto) {
    return this.utmService.create(createUtmDto);
  }

  @Get()
  findAll() {
    return this.utmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUtmDto: UpdateUtmDto) {
    return this.utmService.update(+id, updateUtmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utmService.remove(+id);
  }
}
