/**
 * Contrat de base partagé par toutes les entités du domaine.
 */
export interface IBaseEntityData {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
