
const parsedErrors = [
  "TX_TOO_LARGE",
  "BLOCKHASH_EXPIRED",
  "INSUFFICIENT_TOKEN",
  "USER_REJECTED",
  "WALLET_REJECTED",
  "UNKNOWN",
] as const;

type ParsedError = typeof parsedErrors[number];

function getRawErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return JSON.stringify(err);
}

export function parseError(error: unknown): ParsedError {
  const message = getRawErrorMessage(error);

  if (parsedErrors.includes(error as ParsedError)) {
    return error as ParsedError;
  }

  if (message.includes("Transaction too large")) {
    return "TX_TOO_LARGE";
  }

  if (
    message.includes("unsettled within timeout") ||
    message.includes("blockhash") ||
    message.includes("block height exceeded") ||
    message.includes("RacePromise: Expired") ||
    message.includes("BlockhashNotFound")
  ) {
    return "BLOCKHASH_EXPIRED";
  }

  if (
    message.includes("custom program error: 0x1") ||
    message.includes("\"Custom\":1")
  ) {
    return "INSUFFICIENT_TOKEN";
  }

  if (
    message.includes("User rejected the request") ||
    message.includes("Transaktion storniert") ||
    message.includes("交易已取消") ||
    message.includes("Transaction canceled") ||
    message.includes("User denied request signature") ||
    message.includes("Транзакция отменена") ||
    message.includes("Approval Denied") ||
    message.includes("reject") ||
    message.includes("sign request declined")
  ) {
    return "USER_REJECTED";
  }

  if (
    message.includes("Transaction rejected") ||
    message.includes("Requested resource not available")
  ) {
    return "WALLET_REJECTED";
  }

  return "UNKNOWN";
}

export function humanReadable(error: unknown): string {
  const parsed = parseError(error);
  // Only errors that the user can resolve
  switch (parsed) {
    case "USER_REJECTED": return "You rejected the transaction.";
    case "WALLET_REJECTED": return "Your wallet rejected the transaction.";
    case "INSUFFICIENT_TOKEN": return "You don't have enough tokens to complete the transaction.";
    case "BLOCKHASH_EXPIRED": return "The blockhash expired before the transaction could be confirmed.";
    default: return "An unknown error occurred.";
  }
}
