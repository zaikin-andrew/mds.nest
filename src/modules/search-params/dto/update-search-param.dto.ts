import { PartialType } from '@nestjs/swagger';
import { CreateSearchParamDto } from './create-search-param.dto';

export class UpdateSearchParamDto extends PartialType(CreateSearchParamDto) {}
