import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VkService } from './vk.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [VkService],
  exports: [VkService],
})
export class VkModule {}
