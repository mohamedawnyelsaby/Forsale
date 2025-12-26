/**
 * @fileoverview Forsale Payment Module Entry Point
 * Defines the public API for the payments service.
 */

// Export everything from the pi-network module
// Remove .js extension for TypeScript source files
export * from './pi-network';

// Export a singleton instance for convenience
import { PiNetworkClient } from './pi-network';
export const piNetworkClient = new PiNetworkClient();
