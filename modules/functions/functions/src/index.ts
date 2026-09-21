import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

// Keep a lid on concurrency so a runaway loop cannot drain the billing account.
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// Feature modules register their exports here.
// radiance:functions:start
// radiance:functions:end

export { ping } from './callable/ping';
export { cleanupStaleDocs } from './scheduled/cleanupStaleDocs';
