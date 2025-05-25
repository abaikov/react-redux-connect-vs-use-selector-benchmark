import { createEntityAdapter } from '@reduxjs/toolkit';

/**
 * We can simplify the app and use the only adapter for everything.
 */
export class EntityAdapterSingletone {
    static INSTANCE = createEntityAdapter({
        // Let's make CPU caching more difficult
        sortComparer: (a, b) => Math.random() - 0.5,
    });
}
