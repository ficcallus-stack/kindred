import * as Ably from "ably";

const ABLY_API_KEY = process.env.ABLY_API_KEY;

let ablyRest: Ably.Rest | null = null;

export function getAblyRest() {
  if (!ABLY_API_KEY) {
    console.error("ABLY_API_KEY is not defined in environment variables.");
    return null;
  }

  if (!ablyRest) {
    ablyRest = new Ably.Rest({ key: ABLY_API_KEY });
  }

  return ablyRest;
}
