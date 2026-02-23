import { Injectable } from '@nestjs/common';
import { CreateSearchParamDto } from './dto/create-search-param.dto';
import { UpdateSearchParamDto } from './dto/update-search-param.dto';

@Injectable()
export class SearchParamsService {
  create(createSearchParamDto: CreateSearchParamDto) {
    return 'This action adds a new searchParam';
  }

  findAll() {
    return `This action returns all searchParams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} searchParam`;
  }

  update(id: number, updateSearchParamDto: UpdateSearchParamDto) {
    return `This action updates a #${id} searchParam`;
  }

  remove(id: number) {
    return `This action removes a #${id} searchParam`;
  }
}
