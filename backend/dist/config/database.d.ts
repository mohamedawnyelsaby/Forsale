import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    log: ("error" | "warn")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map