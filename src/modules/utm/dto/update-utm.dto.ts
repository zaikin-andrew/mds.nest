import { PartialType } from '@nestjs/swagger';
import { CreateUtmDto } from './create-utm.dto';

export class UpdateUtmDto extends PartialType(CreateUtmDto) {}
