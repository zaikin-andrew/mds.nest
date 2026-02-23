import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchParamsService } from './search-params.service';
import { CreateSearchParamDto } from './dto/create-search-param.dto';
import { UpdateSearchParamDto } from './dto/update-search-param.dto';

@Controller('search-params')
export class SearchParamsController {
  constructor(private readonly searchParamsService: SearchParamsService) {}

  @Post()
  create(@Body() createSearchParamDto: CreateSearchParamDto) {
    return this.searchParamsService.create(createSearchParamDto);
  }

  @Get()
  findAll() {
    return this.searchParamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchParamsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSearchParamDto: UpdateSearchParamDto) {
    return this.searchParamsService.update(+id, updateSearchParamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchParamsService.remove(+id);
  }
}
