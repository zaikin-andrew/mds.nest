import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SelectionsService } from './selections.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';

@Controller('selections')
export class SelectionsController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Post()
  create(@Body() createSelectionDto: CreateSelectionDto) {
    return this.selectionsService.create(createSelectionDto);
  }

  @Get()
  findAll() {
    return this.selectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.selectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSelectionDto: UpdateSelectionDto) {
    return this.selectionsService.update(+id, updateSelectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.selectionsService.remove(+id);
  }
}
