import { describe, expect, it } from 'vitest';
import { SlugGenerator } from '@/utils/SlugGenerator';

describe('SlugGenerator', () => {
  it('génère un slug en minuscules avec des tirets', () => {
    expect(SlugGenerator.generate('Hello World')).toBe('hello-world');
  });

  it('supprime les accents', () => {
    expect(SlugGenerator.generate('Pépite à étudier')).toBe('pepite-a-etudier');
  });

  it('compresse les espaces et caractères spéciaux', () => {
    expect(SlugGenerator.generate('Foo   --  Bar!')).toBe('foo-bar');
  });

  it('renvoie une chaîne vide pour une entrée vide (cas géré en amont par Zod)', () => {
    expect(SlugGenerator.generate('')).toBe('');
  });
});
