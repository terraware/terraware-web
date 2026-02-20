const ctx = require.context('./', true, /\.ts$/) as any;
(ctx.keys() as string[]).filter((key) => key !== './index.ts').forEach(ctx);
