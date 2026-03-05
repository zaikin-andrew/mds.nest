import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchParamsService } from './search-params.service';
import { CreateSearchParamDto } from './dto/create-search-param.dto';
import { UpdateSearchParamDto } from './dto/update-search-param.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('search-params')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('search-params')
export class SearchParamsController {
  constructor(private readonly searchParamsService: SearchParamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a search param entry' })
  create(@Body() createSearchParamDto: CreateSearchParamDto) {
    return this.searchParamsService.create(createSearchParamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all search param entries' })
  findAll() {
    return this.searchParamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a search param entry by id' })
  findOne(@Param('id') id: string) {
    return this.searchParamsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a search param entry' })
  update(@Param('id') id: string, @Body() updateSearchParamDto: UpdateSearchParamDto) {
    return this.searchParamsService.update(+id, updateSearchParamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a search param entry' })
  remove(@Param('id') id: string) {
    return this.searchParamsService.remove(+id);
  }
}
