export interface Pool {
  readonly address: string;
  readonly name: string;
  readonly supply: number;
  readonly available: number;
  readonly price: number;
  readonly priceTimestamp: number;
  readonly uri: string;
}
