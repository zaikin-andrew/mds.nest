import { Injectable } from '@nestjs/common';

@Injectable()
export class AudiobooksService {
  findAll() {
    return `This action returns all audiobooks`;
  }

  getRandomAudiobook() {
    return `This action returns a  audiobook`;
  }
}
