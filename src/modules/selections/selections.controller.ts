import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SelectionsService } from './selections.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('selections')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('selections')
export class SelectionsController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a selection' })
  create(@Body() createSelectionDto: CreateSelectionDto) {
    return this.selectionsService.create(createSelectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all selections' })
  findAll() {
    return this.selectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a selection by id' })
  findOne(@Param('id') id: string) {
    return this.selectionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a selection' })
  update(@Param('id') id: string, @Body() updateSelectionDto: UpdateSelectionDto) {
    return this.selectionsService.update(+id, updateSelectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a selection' })
  remove(@Param('id') id: string) {
    return this.selectionsService.remove(+id);
  }
}
