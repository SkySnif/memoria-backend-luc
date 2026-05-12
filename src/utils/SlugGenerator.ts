/**
 * Génère un slug URL-friendly depuis un titre.
 * Gère les accents (NFD normalisation) et nettoie les caractères spéciaux.
 *
 * Exemples :
 *  "Apprendre Node.js" → "apprendre-nodejs"
 *  "Café & Croissants"  → "cafe-croissants"
 */
export class SlugGenerator {
  public static generate(title: string): string {
    return title
      .normalize('NFD') // décompose les accents
      .replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // ne garde que alphanum, espaces, tirets
      .replace(/[\s_-]+/g, '-') // normalise séparateurs en un tiret
      .replace(/^-+|-+$/g, ''); // supprime les tirets en début/fin
  }
}
