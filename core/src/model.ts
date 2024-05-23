export interface Pool {
  readonly address: string;
  readonly name: string;
  readonly supply: number;
  readonly available: number;
  readonly price: number;
  readonly priceTimestamp: number;
  readonly uri: string;
}

export interface Token {
  readonly address: string;
  readonly collection: string;
  readonly name: string;
  readonly isAvailable: boolean;
  readonly uri: string;
}

