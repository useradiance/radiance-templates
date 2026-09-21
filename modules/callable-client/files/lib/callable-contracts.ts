/**
 * Request and response shapes for every callable Cloud Function.
 *
 * Keep this in step with `functions/src/index.ts` — it is the only thing standing between a
 * renamed backend field and a runtime crash in the app.
 */
export type CallableContracts = {
  ping: {
    request: Record<string, never>;
    response: { ok: boolean; uid: string; at: string };
  };
  // radiance:contracts:start
  // radiance:contracts:end
};
