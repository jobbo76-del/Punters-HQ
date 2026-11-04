import { useEffect, useMemo, useState } from 'react';
import { api } from '@appdeploy/client';
import RaceCentre from './RaceCentre';

type Entry = {
  id: string;
  horse: string;
  race: string;
  date: string;
  stake: number;
  odds: number;
  result: 'Pending' | 'Won' | 'Lost';
  bookmaker?: string;
};

type Section =
  | 'Home'
  | 'Tracker'
  | 'Insights'
  | 'Race tools'
  | 'Race Centre'
  | 'Learn'
  | 'Challenges'
  | 'Safer play';

const STORAGE_KEY = 'punters-hq-tracker-v1';
const LIMIT_KEY = 'punters-hq-limit-v1';

const demoLeaderboard = [
  { name: 'TracksideTom', points: 1280, label: 'Sample player' },
  { name: 'LuckyLegs', points: 1145, label: 'Sample player' },
  { name: 'FormFinder', points: 990, label: 'Sample player' },
  { name: 'ThePaddock', points: 875, label: 'Sample player' },
];

const lessons = [
  {
    title: 'Reading a form guide',
    time: '5 min',
    text: 'Learn what recent starts, finishing positions and conditions can tell you — and what they cannot.',
  },
  {
    title: 'Odds and implied probability',
    time: '6 min',
    text: 'Understand decimal odds and the difference between market probability and certainty.',
  },
  {
    title: 'Small samples can mislead',
    time: '4 min',
    text: 'A short winning streak is not proof of an edge. Learn to look at sample size and variance.',
  },
  {
    title: 'Build a personal record',
    time: '5 min',
    text: 'Track every selection consistently, including the ones you decide not to back.',
  },
];

function readEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 2,
  }).format(value);
}

function App() {
  const [section, setSection] = useState<Section>('Home');
  const [entries, setEntries] = useState<Entry[]>(readEntries);
  const [horse, setHorse] = useState('');
  const [race, setRace] = useState('');
  const [stake, setStake] = useState('');
  const [odds, setOdds] = useState('');
  const [result, setResult] = useState<Entry['result']>('Pending');
  const [bookmaker, setBookmaker] = useState('');
  const [message, setMessage] = useState('');
  const [insight, setInsight] = useState('');
  const [insightError, setInsightError] = useState('');
  const [thinking, setThinking] = useState(false);
  const [weeklyLimit, setWeeklyLimit] = useState(
    () => localStorage.getItem(LIMIT_KEY) || '50'
  );
  const [soundOn, setSoundOn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [singleOdds, setSingleOdds] = useState('3.50');
  const [multiOdds, setMultiOdds] = useState('2.00, 3.00');
  const singleProbability =
    Number(singleOdds) >= 1 ? 100 / Number(singleOdds) : 0;
  const multiTotalOdds = multiOdds
    .split(',')
    .map(value => Number(value.trim()))
    .filter(value => Number.isFinite(value) && value >= 1)
    .reduce((total, value) => total * value, 1);
  const multiLegCount = multiOdds
    .split(',')
    .map(value => value.trim())
    .filter(value => value.length > 0).length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(LIMIT_KEY, weeklyLimit);
  }, [weeklyLimit]);

  // Expose safe, read-only actions to browsers that implement the WebMCP
  // imperative API. The app remains fully usable when WebMCP is unavailable.
  useEffect(() => {
    const modelContext = (
      document as Document & {
        modelContext?: {
          registerTool?: (
            tool: {
              name: string;
              title: string;
              description: string;
              inputSchema: Record<string, unknown>;
              annotations: {
                readOnlyHint: boolean;
                untrustedContentHint: boolean;
              };
              execute: (input: unknown) => unknown;
            },
            options?: { signal?: AbortSignal }
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (!modelContext?.registerTool) return;

    const lifecycle = new AbortController();
    const register = async () => {
      try {
        await modelContext.registerTool?.(
          {
            name: 'read_punters_hq_tracker_summary',
            title: 'Read Punters HQ tracker summary',
            description:
              'Read a concise summary of the current device-local Punters HQ tracker. This is read-only and does not place bets or change records.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute: () => {
              const current = readEntries();
              const settled = current.filter(item => item.result !== 'Pending');
              const won = settled.filter(item => item.result === 'Won');
              const lostStake = settled
                .filter(item => item.result === 'Lost')
                .reduce((sum, item) => sum + item.stake, 0);
              const returned = won.reduce(
                (sum, item) => sum + item.stake * item.odds,
                0
              );
              const totalSettledStake = settled.reduce(
                (sum, item) => sum + item.stake,
                0
              );
              return {
                recordCount: current.length,
                settledCount: settled.length,
                pendingCount: current.length - settled.length,
                wins: won.length,
                losses: settled.length - won.length,
                settledStakeAUD: Number(totalSettledStake.toFixed(2)),
                returnsAUD: Number(returned.toFixed(2)),
                netAUD: Number((returned - totalSettledStake).toFixed(2)),
                note: 'Device-local user-entered records only. Not live racing data or betting advice.',
              };
            },
          },
          { signal: lifecycle.signal }
        );

        await modelContext.registerTool?.(
          {
            name: 'calculate_punters_hq_decimal_odds',
            title: 'Calculate decimal odds',
            description:
              'Calculate implied probability and illustrative return from decimal odds and an Australian dollar stake. This is arithmetic only, not a prediction.',
            inputSchema: {
              type: 'object',
              properties: {
                decimalOdds: { type: 'number', minimum: 1 },
                stakeAUD: { type: 'number', minimum: 0 },
              },
              required: ['decimalOdds', 'stakeAUD'],