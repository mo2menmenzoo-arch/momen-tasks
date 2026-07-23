import { v4 as uuidv4 } from 'uuid';

export class UuidUtil {
  static generate(): string {
    return uuidv4();
  }

  static isValid(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
