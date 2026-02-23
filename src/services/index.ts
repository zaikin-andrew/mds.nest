import { FirebaseService } from './firebase/firebase.service';
import { VkService } from './vk/vk.service';
import { OpenaiService } from './openai/openai.service';
import { YandexStorageService } from './yandex-storage/yandex-storage.service';
import { RustoreService } from './rustore/rustore.service';

export default [FirebaseService, VkService, OpenaiService, YandexStorageService, RustoreService];
