const ctx = require.context('./', true, /^(?!.*\.test\.ts$).*\.ts$/) as any;
(ctx.keys() as string[]).filter((key) => key !== './index.ts').forEach(ctx);
