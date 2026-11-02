import { router, json, error, ai } from '@appdeploy/sdk';

type InsightEntry = {
  horse?: string;
  race?: string;
  stake?: number;
  odds?: number;
  result?: 'Pending' | 'Won' | 'Lost';
};

export const handler = router({
  'GET /api/health': [async () => json({ status: 'ok' })],
  'POST /api/insights': [
    async ({ body }) => {
      const payload = body as { entries?: InsightEntry[]; demo?: boolean };
      const entries = Array.isArray(payload?.entries)
        ? payload.entries.slice(0, 30)
        : [];
      const demo = entries.length === 0 || payload?.demo === true;
      const dataset = demo
        ? [
            { horse: 'Sample Runner A', race: 'Demo Race 1', stake: 10, odds: 3.2, result: 'Won' },
            { horse: 'Sample Runner B', race: 'Demo Race 2', stake: 10, odds: 2.4, result: 'Lost' },
            { horse: 'Sample Runner C', race: 'Demo Race 3', stake: 5, odds: 4.5, result: 'Pending' },
          ]
        : entries;

      try {
        const result = await ai.generate({
          system:
            'You are a cautious educational record-review assistant for a responsible horse-racing tracker. Never recommend a bet, predict a winner, suggest increasing stakes, or imply that past performance predicts future results. Do not invent missing facts. Explain that small samples are unreliable. Use plain Australian English and concise bullet points.',
          prompt:
            'Review this ' +
            (demo ? 'ILLUSTRATIVE DEMO DATASET' : 'user-entered tracker dataset') +
            '. Explain only descriptive patterns, totals or record-keeping observations that can be derived from the supplied rows. Flag small sample size and uncertainty. End by reminding the user that this is not betting advice and no outcome is guaranteed. Data: ' +
            JSON.stringify(dataset),
          maxTokens: 350,
          temperature: 0.3,
          thinkingMode: 'FAST',
        });
        return json({ insight: result.text, demo });
      } catch (err) {
        console.error('Insights generation failed', err);
        return error('Insights are temporarily unavailable. Please try again later.', 503);
      }
    },
  ],
});
