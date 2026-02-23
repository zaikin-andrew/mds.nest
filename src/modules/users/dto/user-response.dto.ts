import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty()
  subscriberId: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  purchaseDate: Date;

  @ApiProperty()
  durationMonths: number;

  @ApiPropertyOptional()
  nextPaymentDate?: Date;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  status: string;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  picture?: string;

  @ApiProperty()
  aiSearches: number;

  @ApiPropertyOptional({ type: SubscriptionDto })
  subscription?: SubscriptionDto;
}

export class UserProfileResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ type: UserProfileDto })
  data: UserProfileDto;
}
