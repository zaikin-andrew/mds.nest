import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from '../../config/config.service';
import { ANNOTATION_PROMPT } from './prompts/create-annotation.prompt';

export interface BatchRequest {
  custom_id: string;
  method: string;
  url: string;
  body: {
    model: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  };
}

export interface BatchResult {
  id: string;
  annotation: string;
  error?: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly client: OpenAI;

  constructor(private readonly appConfig: AppConfigService) {
    this.client = new OpenAI({
      apiKey: this.appConfig.openaiToken,
      timeout: 120_000,
      maxRetries: 3,
    });
  }

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    this.logger.log(`Uploading file: ${fileName}`);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    const file = new File([arrayBuffer], fileName, { type: 'application/pdf' });

    const uploaded = await this.client.files.create({ file, purpose: 'assistants' });
    this.logger.log(`File uploaded: ${uploaded.id}`);
    return uploaded.id;
  }

  async generateAnnotation(fileId: string): Promise<string> {
    this.logger.log(`Generating annotation for file: ${fileId}`);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: { file_id: fileId },
            } as unknown as OpenAI.Chat.Completions.ChatCompletionContentPart,
            { type: 'text', text: ANNOTATION_PROMPT },
          ],
        },
      ],
    });

    const annotation = response.choices[0]?.message?.content || '';
    this.logger.log(`Generated annotation (${annotation.length} chars)`);
    return annotation;
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.client.files.delete(fileId);
      this.logger.log(`Deleted file: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileId}`, error);
    }
  }

  createBatchRequest(customId: string, fileId: string): BatchRequest {
    return {
      custom_id: customId,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-4.1',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'file',
                file: { file_id: fileId },
              } as unknown as OpenAI.Chat.Completions.ChatCompletionContentPart,
              { type: 'text', text: ANNOTATION_PROMPT },
            ],
          },
        ],
      },
    };
  }

  async uploadBatchFile(requests: BatchRequest[]): Promise<string> {
    this.logger.log(`Creating batch file with ${requests.length} requests`);
    const jsonlContent = requests.map((r) => JSON.stringify(r)).join('\n');
    const buffer = Buffer.from(jsonlContent, 'utf-8');
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    const file = new File([arrayBuffer], 'batch_requests.jsonl', {
      type: 'application/jsonl',
    });

    const uploaded = await this.client.files.create({ file, purpose: 'batch' });
    this.logger.log(`Batch file uploaded: ${uploaded.id}`);
    return uploaded.id;
  }

  async createBatch(inputFileId: string): Promise<string> {
    this.logger.log(`Creating batch job for file: ${inputFileId}`);
    const batch = await this.client.batches.create({
      input_file_id: inputFileId,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    });
    this.logger.log(`Batch created: ${batch.id} (${batch.status})`);
    return batch.id;
  }

  async waitForBatch(batchId: string, pollIntervalMs = 30_000): Promise<OpenAI.Batches.Batch> {
    this.logger.log(`Waiting for batch ${batchId}...`);
    while (true) {
      const batch = await this.client.batches.retrieve(batchId);
      this.logger.log(`Batch ${batchId} status: ${batch.status}`);

      if (batch.status === 'completed') return batch;
      if (['failed', 'expired', 'cancelled'].includes(batch.status)) {
        throw new Error(`Batch ${batchId} ended with status: ${batch.status}`);
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }

  async getBatchResults(outputFileId: string): Promise<BatchResult[]> {
    this.logger.log(`Downloading batch results: ${outputFileId}`);
    const response = await this.client.files.content(outputFileId);
    const text = await response.text();
    const lines = text.trim().split('\n');

    const results: BatchResult[] = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const customId = parsed.custom_id;
        if (parsed.error) {
          results.push({ id: customId, annotation: '', error: JSON.stringify(parsed.error) });
        } else {
          const annotation = parsed.response?.body?.choices?.[0]?.message?.content || '';
          results.push({ id: customId, annotation });
        }
      } catch (error) {
        this.logger.error('Failed to parse batch result line', error);
      }
    }

    this.logger.log(`Parsed ${results.length} batch results`);
    return results;
  }
}
