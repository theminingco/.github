export interface Pool {
  readonly address: string;
  readonly name: string;
  readonly supply: number;
  readonly price: number;
  readonly priceTimestamp: number;
  readonly image: string;
  readonly allocation: Record<string, string>;
  readonly isReleased: boolean;
}

export interface Token {
  readonly address: string;
  readonly collection: string;
  readonly name: string;
  readonly owner: string;
  readonly image: string;
  readonly allocation: Record<string, string>;
}

