import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('history')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a history entry' })
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all history entries' })
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a history entry by id' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a history entry' })
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(+id, updateHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a history entry' })
  remove(@Param('id') id: string) {
    return this.historyService.remove(+id);
  }
}
