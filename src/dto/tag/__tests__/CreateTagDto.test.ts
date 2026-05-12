import { describe, expect, it } from 'vitest';
import { CreateTagDto } from '@/dto/tag/CreateTagDto';

describe('CreateTagDto', () => {
  it('accepte un tagName valide', () => {
    const dto = new CreateTagDto({ tagName: 'philosophie' });
    expect(dto.tagName).toBe('philosophie');
  });

  it('trim les espaces en début/fin', () => {
    const dto = new CreateTagDto({ tagName: '  histoire  ' });
    expect(dto.tagName).toBe('histoire');
  });

  it('refuse un tagName vide', () => {
    expect((): unknown => new CreateTagDto({ tagName: '' })).toThrow();
  });

  it('refuse un tagName de plus de 50 caractères', () => {
    const tooLong: string = 'a'.repeat(51);
    expect((): unknown => new CreateTagDto({ tagName: tooLong })).toThrow();
  });

  it('refuse un payload sans tagName', () => {
    expect((): unknown => new CreateTagDto({})).toThrow();
  });
});
