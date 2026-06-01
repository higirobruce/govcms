import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

/** Validates a request payload against a shared @govcms/schema zod schema. */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        issues: result.error.issues,
      });
    }
    return result.data;
  }
}
