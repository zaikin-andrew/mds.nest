import { Injectable } from '@nestjs/common';
import { CreateUtmDto } from './dto/create-utm.dto';
import { UpdateUtmDto } from './dto/update-utm.dto';

@Injectable()
export class UtmService {
  create(createUtmDto: CreateUtmDto) {
    return 'This action adds a new utm';
  }

  findAll() {
    return `This action returns all utm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} utm`;
  }

  update(id: number, updateUtmDto: UpdateUtmDto) {
    return `This action updates a #${id} utm`;
  }

  remove(id: number) {
    return `This action removes a #${id} utm`;
  }
}
