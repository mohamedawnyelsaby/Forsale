/**
 * @fileoverview Forsale Payment Module Entry Point
 * Defines the public API for the payments service, ensuring seamless 
 * integration with Pi Network and other future gateways.
 * * @version 1.0.0
 * @author Forsale Engineering Team
 */

// Re-exporting the PiNetworkClient instance and class for system-wide access.
// Essential: The .js extension is required for ESM compatibility in Node.js environments.
export * from './pi-network.js';

/**
 * ARCHITECTURE NOTE:
 * This index file serves as the 'Barrel Export' to decouple internal implementation
 * details from the consumer (API service). This ensures high maintainability 
 * and adheres to the Open/Closed Principle.
 */
