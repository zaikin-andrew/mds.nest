import { Injectable } from '@nestjs/common';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';

@Injectable()
export class SelectionsService {
  create(createSelectionDto: CreateSelectionDto) {
    return 'This action adds a new selection';
  }

  findAll() {
    return `This action returns all selections`;
  }

  findOne(id: number) {
    return `This action returns a #${id} selection`;
  }

  update(id: number, updateSelectionDto: UpdateSelectionDto) {
    return `This action updates a #${id} selection`;
  }

  remove(id: number) {
    return `This action removes a #${id} selection`;
  }
}
