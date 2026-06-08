import { createContext } from 'react';

/** Isolated context instance — prevents duplicate providers on web/static bundles. */
export const AudioPlayerContext = createContext<unknown>(null);
