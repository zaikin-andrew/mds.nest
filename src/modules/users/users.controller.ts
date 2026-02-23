import { Controller, Delete, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserInfo } from '../../common/interfaces/user-info.interface';
import { UsersService } from './users.service';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('info')
  @ApiOperation({ summary: 'Get current user profile with subscription and AI search info' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  getInfo(@CurrentUser() user: UserInfo) {
    return this.usersService.getOrCreateUser(user);
  }

  @UseGuards(AuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all user data (history, playlists, account)' })
  @ApiNoContentResponse({ description: 'User data deleted successfully' })
  remove(@CurrentUser() user: UserInfo) {
    return this.usersService.deleteAllUserData(user.id);
  }
}
