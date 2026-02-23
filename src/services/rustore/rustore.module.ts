import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RustoreService } from './rustore.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [RustoreService],
  exports: [RustoreService],
})
export class RustoreModule {}
