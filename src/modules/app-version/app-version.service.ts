import { Injectable } from '@nestjs/common';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';

@Injectable()
export class AppVersionService {
  create(createAppVersionDto: CreateAppVersionDto) {
    return 'This action adds a new appVersion';
  }

  findAll() {
    return `This action returns all appVersion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appVersion`;
  }

  update(id: number, updateAppVersionDto: UpdateAppVersionDto) {
    return `This action updates a #${id} appVersion`;
  }

  remove(id: number) {
    return `This action removes a #${id} appVersion`;
  }
}
