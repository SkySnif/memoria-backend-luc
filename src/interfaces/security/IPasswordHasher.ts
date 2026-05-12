export interface IPasswordHasher {
  hash(plaintext: string): Promise<string>;
  verify(plaintext: string, hashStr: string): Promise<boolean>;
}
