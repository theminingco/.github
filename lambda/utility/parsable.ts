import { PublicKey } from "@solana/web3.js";
import { HttpsError } from "firebase-functions/v2/https";

export class Parsable {
  public readonly parsable: unknown;

  public constructor(parsable: unknown) {
    this.parsable = parsable;
  }

  // Base types

  public string(): string {
    if (typeof this.parsable !== "string") { throw new HttpsError("invalid-argument", `Expected argument of type string, found ${typeof this.parsable}.`); }
    return this.parsable;
  }

  public number(): number {
    if (typeof this.parsable !== "number") { throw new HttpsError("invalid-argument", `Expected argument of type number, found ${typeof this.parsable}.`); }
    return this.parsable;
  }

  public boolean(): boolean {
    if (typeof this.parsable !== "boolean") { throw new HttpsError("invalid-argument", `Expected argument of type boolean, found ${typeof this.parsable}.`); }
    return this.parsable;
  }

  // Nested Types

  public optional(): this | null {
    if (this.parsable == null) { return null; }
    return this;
  }

  private object(): object {
    if (typeof this.parsable !== "object") { throw new HttpsError("invalid-argument", `Expected argument of type object, found ${typeof this.parsable}.`); }
    if (this.parsable == null) { throw new HttpsError("invalid-argument", "Expected argument of type object, found null."); }
    return this.parsable;
  }

  public array(): Array<Parsable> {
    const object = this.object();
    if (!Array.isArray(object)) { throw new HttpsError("invalid-argument", "Expected argument of type array, found something else."); }
    return object.map(value => new Parsable(value));
  }

  public index(index: number): Parsable {
    const array = this.array();
    if (array.length <= index) { throw new HttpsError("invalid-argument", `Index ${index} does not exist on array of length ${array.length}.`); }
    return array[index];
  }

  public map(): Map<string, Parsable> {
    const object = this.object();
    if (Array.isArray(object)) { throw new HttpsError("invalid-argument", "Expected argument of type record, found array."); }
    const values = Object.entries(object).map(([key, value]) => [key, new Parsable(value)] as [string, Parsable]);
    return new Map(values);
  }

  public key(key: string): Parsable {
    const object = this.map();
    const value = object.get(key);
    if (value == null) { throw new HttpsError("invalid-argument", `Expected object with key ${key}.`); }
    return value;
  }

  // Sub Types

  public publicKey(): PublicKey {
    const str = this.string();
    try {
      return new PublicKey(str);
    } catch {
      throw new HttpsError("invalid-argument", "Argument is not a valid public key.");
    }
  }

}
