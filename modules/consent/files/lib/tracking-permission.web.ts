/** Web has no App Tracking Transparency; consent comes from the banner instead. */
export async function requestTrackingPermission(): Promise<boolean> {
  return false;
}
