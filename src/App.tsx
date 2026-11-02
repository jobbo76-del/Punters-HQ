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
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute: (input: unknown) => {
              const values = input as {
                decimalOdds?: number;
                stakeAUD?: number;
              };
              const price = Number(values?.decimalOdds);
              const amount = Number(values?.stakeAUD);
              if (
                !Number.isFinite(price) ||
                price < 1 ||
                !Number.isFinite(amount) ||
                amount < 0
              ) {
                throw new Error(
                  'Enter decimal odds of 1.00 or higher and a non-negative stake.'
                );
              }
              return {
                impliedProbabilityPercent: Number((100 / price).toFixed(2)),
                illustrativeReturnAUD: Number((amount * price).toFixed(2)),
                illustrativeProfitAUD: Number(
                  (amount * (price - 1)).toFixed(2)
                ),
                note: 'Price-implied probability excludes bookmaker margin and is not a true-chance estimate.',
              };
            },
          },
          { signal: lifecycle.signal }
        );
      } catch (error) {
        console.warn('WebMCP tools could not be registered', error);
      }
    };

    void register();
    return () => lifecycle.abort();
  }, []);

  const stats = useMemo(() => {
    const totalStake = entries.reduce((sum, item) => sum + item.stake, 0);
    const returns = entries.reduce(
      (sum, item) => sum + (item.result === 'Won' ? item.stake * item.odds : 0),
      0
    );
    const settled = entries.filter(item => item.result !== 'Pending');
    const wins = settled.filter(item => item.result === 'Won').length;
    return {
      totalStake,
      returns,
      net: returns - settled.reduce((sum, item) => sum + item.stake, 0),
      settled: settled.length,
      strikeRate: settled.length
        ? Math.round((wins / settled.length) * 100)
        : 0,
      pending: entries.filter(item => item.result === 'Pending').length,
    };
  }, [entries]);

  const weeklyStake = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return entries
      .filter(item => new Date(item.date) >= cutoff)
      .reduce((sum, item) => sum + item.stake, 0);
  }, [entries]);

  const addEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const stakeValue = Number(stake);
    const oddsValue = Number(odds);
    if (!horse.trim() || !race.trim()) {
      setMessage('Add the horse and race details first.');
      return;
    }
    if (!Number.isFinite(stakeValue) || stakeValue <= 0) {
      setMessage('Enter a stake greater than $0.');
      return;
    }
    if (!Number.isFinite(oddsValue) || oddsValue < 1) {
      setMessage('Enter decimal odds of 1.00 or higher.');
      return;
    }
    const entry: Entry = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      horse: horse.trim(),
      race: race.trim(),
      date: new Date().toISOString(),
      stake: stakeValue,
      odds: oddsValue,
      result,
      bookmaker: bookmaker || undefined,
    };
    setEntries(current => [entry, ...current]);
    setHorse('');
    setRace('');
    setStake('');
    setOdds('');
    setResult('Pending');
    setBookmaker('');
    setMessage('Entry saved on this device.');
    setShowConfetti(true);
    if (soundOn) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.frequency.value = 660;
          gain.gain.setValueAtTime(0.06, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.16
          );
          oscillator.start();
          oscillator.stop(context.currentTime + 0.16);
        }
      } catch {
        // Sound is optional; saving must still work.
      }
    }
    window.setTimeout(() => setShowConfetti(false), 1300);
  };

  const updateResult = (id: string, next: Entry['result']) => {
    setEntries(current =>
      current.map(item => (item.id === id ? { ...item, result: next } : item))
    );
  };

  const deleteEntry = (id: string) => {
    if (window.confirm('Delete this tracker entry? This cannot be undone.')) {
      setEntries(current => current.filter(item => item.id !== id));
    }
  };

  const exportFullBackup = () => {
    const backupKeys = [
      'punters-hq-tracker-v1',
      'punters-hq-limit-v1',
      'punters-hq-race-notes-v1',
      'punters-hq-bankroll-v1',
      'punters-hq-daily-limit-v1',
      'punters-hq-race-centre-v1',
      'punters-hq-provider-setup-v1',
    ];
    const storage = Object.fromEntries(
      backupKeys.map(key => [key, localStorage.getItem(key)])
    );
    const backup = {
      format: 'punters-hq-full-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      storage,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'punters-hq-full-backup.json';
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const importFullBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const backupKeys = [
      'punters-hq-tracker-v1',
      'punters-hq-limit-v1',
      'punters-hq-race-notes-v1',
      'punters-hq-bankroll-v1',
      'punters-hq-daily-limit-v1',
      'punters-hq-race-centre-v1',
      'punters-hq-provider-setup-v1',
    ];
    try {
      const backup = JSON.parse(await file.text()) as {
        format?: string;
        version?: number;
        storage?: Record<string, unknown>;
      };
      if (
        backup.format !== 'punters-hq-full-backup' ||
        backup.version !== 1 ||
        !backup.storage
      ) {
        throw new Error('This is not a Punters HQ full backup file.');
      }
      const restoredValues = backupKeys.map(key => {
        const value = backup.storage?.[key];
        if (value !== null && typeof value !== 'string') {
          throw new Error('The backup contains an invalid saved item.');
        }
        if (typeof value === 'string') JSON.parse(value);
        return [key, value] as const;
      });
      if (
        !window.confirm(
          'Restore this Punters HQ backup on this device? It will replace the existing tracker, notes, race workspaces and settings on this browser.'
        )
      ) {
        return;
      }
      restoredValues.forEach(([key, value]) => {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      });
      window.alert('Backup restored. Punters HQ will now reload your saved records.');
      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'The backup could not be read. Your existing records have not been changed.'
      );
    } finally {
      event.target.value = '';
    }
  };

  const runInsights = async () => {
    setThinking(true);
    setInsightError('');
    setInsight('');
    try {
      const response = await api.post('/api/insights', {
        entries: entries
          .slice(0, 30)
          .map(({ horse, race, stake, odds, result }) => ({
            horse,
            race,
            stake,
            odds,
            result,
          })),
        demo: entries.length === 0,
      });
      setInsight(
        String(response.data?.insight || 'No insight was returned. Try again.')
      );
    } catch {
      setInsightError(
        'Insights are temporarily unavailable. Your tracker is safe; please try again later.'
      );
    } finally {
      setThinking(false);
    }
  };

  const nav: Section[] = [
    'Home',
    'Tracker',
    'Insights',
    'Race tools',
    'Race Centre',
    'Learn',
    'Challenges',
    'Safer play',
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setSection('Home')}
          aria-label="Punters HQ home"
        >
          <span className="brand-mark">♞</span>
          <span>
            <strong>PUNTERS HQ</strong>
            <small>THE SMARTER PUNTING COMPANION</small>
          </span>
        </button>
        <div className="top-note">
          <span className="live-dot" /> DEMO EDITION{' '}
          <span className="top-divider">|</span> AUSTRALIA
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="side-label">YOUR HQ</div>
          {nav.map(item => (
            <button
              key={item}
              className={section === item ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setSection(item);
                setMessage('');
              }}
            >
              <span className="nav-icon">
                {
                  (
                    {
                      Home: '⌂',
                      Tracker: '▤',
                      Insights: '◈',
                      'Race tools': '♧',
                      'Race Centre': '🏇',
                      Learn: '▣',
                      Challenges: '✦',
                      'Safer play': '♡',
                    } as Record<Section, string>
                  )[item]
                }
              </span>
              {item}
            </button>
          ))}
          <div className="sidebar-bottom">
            <div className="side-label">A QUICK REMINDER</div>
            <p>Keep it measured. No system can remove the risk of losing.</p>
            <button
              className="text-link"
              onClick={() => setSection('Safer play')}
            >
              Safer play tools →
            </button>
          </div>
        </aside>

        <main className="main-content">
          {section === 'Home' && (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">MONDAY · YOUR PERSONAL RACING DESK</p>
                  <h1>
                    Welcome to your <span>HQ.</span>
                  </h1>
                  <p className="subheading">
                    A clearer view of your selections, learning and habits.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setSection('Tracker')}
                >
                  ＋ Add a selection
                </button>
              </section>
              <div className="notice">
                <span>ⓘ</span>
                <div>
                  <strong>Demo edition — not live racing data.</strong>
                  <p>
                    Examples and leaderboard names are illustrative. No tips,
                    odds or results are supplied as live information.
                  </p>
                </div>
              </div>
              <section className="stat-grid">
                <Stat
                  label="TOTAL STAKED"
                  value={money(stats.totalStake)}
                  detail="All saved entries"
                />
                <Stat
                  label="NET RESULT"
                  value={money(stats.net)}
                  detail="Settled entries only"
                  positive={stats.net >= 0}
                />
                <Stat
                  label="STRIKE RATE"
                  value={stats.strikeRate + '%'}
                  detail={stats.settled + ' settled entries'}
                />
                <Stat
                  label="PENDING"
                  value={String(stats.pending)}
                  detail="Awaiting your result"
                />
              </section>
              <div className="home-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">YOUR ACTIVITY</p>
                      <h2>Recent selections</h2>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => setSection('Tracker')}
                    >
                      Open tracker →
                    </button>
                  </div>
                  {entries.length === 0 ? (
                    <EmptyState
                      title="Your tracker starts here"
                      text="Add a selection to build your own record. Your entries stay on this device."
                      action="Add first selection"
                      onClick={() => setSection('Tracker')}
                    />
                  ) : (
                    <div className="recent-list">
                      {entries.slice(0, 4).map(item => (
                        <div className="recent-row" key={item.id}>
                          <div>
                            <strong>{item.horse}</strong>
                            <small>{item.race}</small>
                          </div>
                          <span
                            className={'status ' + item.result.toLowerCase()}
                          >
                            {item.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section className="panel dark-panel">
                  <p className="eyebrow">THE DAILY EDGE</p>
                  <h2>Knowledge beats guesswork.</h2>
                  <p>
                    Build a consistent record, understand the numbers and make
                    room for the days when doing nothing is the smartest
                    decision.
                  </p>
                  <button
                    className="outline-button"
                    onClick={() => setSection('Learn')}
                  >
                    Explore the learning hub →
                  </button>
                </section>
              </div>
              <section className="panel leaderboard-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">COMMUNITY PREVIEW</p>
                    <h2>Leaderboard</h2>
                  </div>
                  <span className="sample-tag">SAMPLE DATA</span>
                </div>
                <div className="leader-list">
                  {demoLeaderboard.map((person, index) => (
                    <div className="leader-row" key={person.name}>
                      <span className="rank">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="avatar">{person.name.slice(0, 1)}</span>
                      <strong>{person.name}</strong>
                      <small>{person.label}</small>
                      <b>{person.points.toLocaleString()} pts</b>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {section === 'Tracker' && (
            <>
              <PageHeading
                eyebrow="YOUR PERSONAL RECORD"
                title="Punting tracker"
                text="Record selections consistently. This is a record-keeping tool, not a recommendation to bet."
              />
              <div className="tracker-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">NEW RECORD</p>
                      <h2>Add a selection</h2>
                    </div>
                    <span className="plus-icon">＋</span>
                  </div>
                  <form onSubmit={addEntry} className="entry-form">
                    <label>
                      Horse or selection
                      <input
                        value={horse}
                        onChange={e => setHorse(e.target.value)}
                        placeholder="e.g. Example Runner"
                      />
                    </label>
                    <label>
                      Race / meeting
                      <input
                        value={race}
                        onChange={e => setRace(e.target.value)}
                        placeholder="e.g. Race 4 · Demo meeting"
                      />
                    </label>
                    <div className="form-two">
                      <label>
                        Stake (AUD)
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={stake}
                          onChange={e => setStake(e.target.value)}
                          placeholder="10.00"
                        />
                      </label>
                      <label>
                        Decimal odds
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={odds}
                          onChange={e => setOdds(e.target.value)}
                          placeholder="3.50"
                        />
                      </label>
                    </div>
                    <label>
                      Bookmaker
                      <select
                        value={bookmaker}
                        onChange={e => setBookmaker(e.target.value)}
                      >
                        <option value="">Not specified</option>
                        <option>Sportsbet</option>
                        <option>TAB</option>
                        <option>Ladbrokes</option>
                        <option>Bet365</option>
                        <option>Unibet</option>
                      </select>
                    </label>
                    <label>
                      Result
                      <select
                        value={result}
                        onChange={e =>
                          setResult(e.target.value as Entry['result'])
                        }
                      >
                        <option>Pending</option>
                        <option>Won</option>
                        <option>Lost</option>
                      </select>
                    </label>
                    <button
                      className="primary-button full-button"
                      type="submit"
                    >
                      Save selection
                    </button>
                    {message && (
                      <p className="form-message" role="status">
                        {message}
                      </p>
                    )}
                  </form>
                  <p className="small-note">
                    A winning return is calculated as stake × decimal odds.
                    Update results when known.
                  </p>
                </section>
                <section className="panel">
                  <p className="eyebrow">YOUR NUMBERS</p>
                  <h2>At a glance</h2>
                  <div className="number-list">
                    <NumberLine
                      label="Total entries"
                      value={String(entries.length)}
                    />
                    <NumberLine
                      label="Total staked"
                      value={money(stats.totalStake)}
                    />
                    <NumberLine
                      label="Returns from wins"
                      value={money(stats.returns)}
                    />
                    <NumberLine
                      label="Net on settled entries"
                      value={money(stats.net)}
                    />
                    <NumberLine label="Pending" value={String(stats.pending)} />
                  </div>
                  <button
                    className="secondary-button full-button"
                    onClick={exportFullBackup}
                  >
                    ↓ Export a full backup
                  </button>
                  <label className="backup-import-control">
                    Restore a full backup from a saved JSON file
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={importFullBackup}
                    />
                  </label>
                  <p className="small-note">
                    Includes tracker entries, racing notes, race workspaces,
                    bankroll limits and provider checklist progress. Save the
                    file somewhere safe. Restoring replaces these records on
                    this device.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">YOUR HISTORY</p>
                    <h2>Saved selections</h2>
                  </div>
                  <span className="count-pill">{entries.length} entries</span>
                </div>
                {entries.length === 0 ? (
                  <EmptyState
                    title="Nothing recorded yet"
                    text="Your saved selections will appear here."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>SELECTION</th>
                          <th>STAKE</th>
                          <th>ODDS</th>
                          <th>BOOKMAKER</th>
                          <th>RESULT</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map(item => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.horse}</strong>
                              <small>{item.race}</small>
                            </td>
                            <td>{money(item.stake)}</td>
                            <td>{item.odds.toFixed(2)}</td>
                            <td>{item.bookmaker || '—'}</td>
                            <td>
                              <select
                                className="status-select"
                                value={item.result}
                                onChange={e =>
                                  updateResult(
                                    item.id,
                                    e.target.value as Entry['result']
                                  )
                                }
                              >
                                <option>Pending</option>
                                <option>Won</option>
                                <option>Lost</option>
                              </select>
                            </td>
                            <td>
                              <button
                                className="delete-button"
                                onClick={() => deleteEntry(item.id)}
                                aria-label={'Delete ' + item.horse}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {section === 'Insights' && (
            <>
              <PageHeading
                eyebrow="PATTERNS, NOT PREDICTIONS"
                title="Insights lab"
                text="Explore how an AI assistant can help review a record. It cannot predict winners or guarantee outcomes."
              />
              <div className="notice">
                <span>✧</span>
                <div>
                  <strong>What this does</strong>
                  <p>
                    It reviews up to 30 of your recent tracker entries. If you
                    have no entries, it uses a clearly labelled example dataset.
                    It does not access live odds, race cards or bookmaker
                    information.
                  </p>
                </div>
              </div>
              <section className="panel insight-panel">
                <div className="insight-orb">◈</div>
                <p className="eyebrow">PUNTERS HQ ANALYSIS</p>
                <h2>A second set of eyes on your record.</h2>
                <p>
                  Ask for a plain-English summary of recorded stakes, results,
                  sample size and possible habits worth reviewing.
                </p>
                <button
                  className="primary-button"
                  onClick={runInsights}
                  disabled={thinking}
                >
                  {thinking ? 'Reviewing your data…' : '✧ Review my record'}
                </button>
                {insight && (
                  <div className="insight-result">
                    <strong>Your review</strong>
                    <p>{insight}</p>
                    <small>
                      AI-generated commentary for reflection only. Not betting
                      advice.
                    </small>
                  </div>
                )}
                {insightError && (
                  <div className="error-message" role="alert">
                    {insightError}
                  </div>
                )}
              </section>
            </>
          )}

          {section === 'Race Centre' && <RaceCentre />}

          {section === 'Race tools' && (
            <>
              <PageHeading
                eyebrow="RACING KNOWLEDGE & NUMBER TOOLS"
                title="Race tools"
                text="Understand the maths, organise your race notes and learn how to read common racing information. These tools do not provide live prices or selections."
              />
              <div className="notice">
                <span>ⓘ</span>
                <div>
                  <strong>
                    Educational tools — not betting recommendations.
                  </strong>
                  <p>
                    Implied probability is not the same as a runner's true
                    chance. Bookmaker margin, changing prices and uncertainty
                    all matter.
                  </p>
                </div>
              </div>
              <div className="tracker-grid">
                <section className="panel">
                  <p className="eyebrow">ODDS EXPLAINER</p>
                  <h2>Decimal odds calculator</h2>
                  <label className="limit-input">
                    Decimal odds
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={singleOdds}
                      onChange={e => setSingleOdds(e.target.value)}
                    />
                  </label>
                  <div className="number-list">
                    <NumberLine
                      label="Implied probability"
                      value={
                        singleProbability > 0
                          ? singleProbability.toFixed(1) + '%'
                          : 'Enter odds of 1.00+'
                      }
                    />
                    <NumberLine
                      label="Return on a $10 stake"
                      value={
                        Number(singleOdds) >= 1
                          ? money(10 * Number(singleOdds))
                          : '—'
                      }
                    />
                    <NumberLine
                      label="Profit on a $10 stake"
                      value={
                        Number(singleOdds) >= 1
                          ? money(10 * (Number(singleOdds) - 1))
                          : '—'
                      }
                    />
                  </div>
                  <p className="small-note">
                    Formula: 100 ÷ decimal odds. This is the probability implied
                    by the price before accounting for bookmaker margin — not a
                    prediction.
                  </p>
                </section>
                <section className="panel">
                  <p className="eyebrow">MULTI-BET MATHS</p>
                  <h2>Combined odds calculator</h2>
                  <label className="limit-input">
                    Enter each leg's decimal odds, separated by commas
                    <input
                      value={multiOdds}
                      onChange={e => setMultiOdds(e.target.value)}
                      placeholder="e.g. 2.00, 3.50, 4.00"
                    />
                  </label>
                  <div className="number-list">
                    <NumberLine
                      label="Valid legs"
                      value={String(multiLegCount)}
                    />
                    <NumberLine
                      label="Combined decimal odds"
                      value={
                        multiLegCount > 0 ? multiTotalOdds.toFixed(2) : '—'
                      }
                    />
                    <NumberLine
                      label="Illustrative return on $5"
                      value={
                        multiLegCount > 0 ? money(5 * multiTotalOdds) : '—'
                      }
                    />
                  </div>
                  <p className="small-note">
                    This is multiplication of entered prices only. It does not
                    estimate the chance of all legs winning. Every additional
                    leg adds another way for a multi to lose.
                  </p>
                </section>
              </div>
              <div className="tracker-grid">
                <OddsComparison />
                <EachWayCalculator />
              </div>
              <div className="lesson-grid">
                <article className="lesson-card">
                  <span className="lesson-number">01</span>
                  <span className="lesson-time">Race reading</span>
                  <h2>Speed maps</h2>
                  <p>
                    A speed map estimates where runners may settle early —
                    leaders, on-pace runners, midfield and backmarkers. It is a
                    guide, not a live GPS feed or a certainty. Barriers, pace
                    pressure and late changes can alter the shape of a race.
                  </p>
                </article>
                <article className="lesson-card">
                  <span className="lesson-number">02</span>
                  <span className="lesson-time">Track conditions</span>
                  <h2>Track ratings</h2>
                  <p>
                    Australian ratings commonly range from Firm through Good,
                    Soft and Heavy. Check the official meeting update: rain,
                    rail position, surface changes and scratchings can change
                    conditions. This demo does not fetch current track ratings.
                  </p>
                </article>
                <article className="lesson-card">
                  <span className="lesson-number">03</span>
                  <span className="lesson-time">Form analysis</span>
                  <h2>Race-day checklist</h2>
                  <p>
                    Review recent form, distance, class, barrier, weight,
                    jockey, track conditions, likely pace and scratchings.
                    Record what you observed before the race, then compare it
                    with the result without rewriting your reasoning afterwards.
                  </p>
                </article>
              </div>
              <RaceNotebook />
            </>
          )}

          {section === 'Learn' && (
            <>
              <PageHeading
                eyebrow="BUILD YOUR KNOWLEDGE"
                title="Learning hub"
                text="Short, practical lessons to help you understand racing information and risk."
              />
              <div className="lesson-grid">
                {lessons.map((lesson, index) => (
                  <article className="lesson-card" key={lesson.title}>
                    <span className="lesson-number">0{index + 1}</span>
                    <span className="lesson-time">{lesson.time} read</span>
                    <h2>{lesson.title}</h2>
                    <p>{lesson.text}</p>
                    <button
                      className="text-link"
                      onClick={() =>
                        setMessage(
                          lesson.title +
                            ': lesson preview selected. Full lesson content is part of the next learning release.'
                        )
                      }
                    >
                      Preview lesson →
                    </button>
                  </article>
                ))}
              </div>
              {message && <p className="form-message">{message}</p>}
            </>
          )}

          {section === 'Challenges' && (
            <>
              <PageHeading
                eyebrow="PROGRESS, NOT PRESSURE"
                title="Challenges & achievements"
                text="Build useful habits around learning and record-keeping. No challenge asks you to increase a stake or place a bet."
              />
              <div className="challenge-grid">
                <Challenge
                  icon="▤"
                  title="Start your record"
                  text="Save your first tracker entry."
                  done={entries.length >= 1}
                  progress={entries.length >= 1 ? 'Complete' : '0 / 1'}
                />
                <Challenge
                  icon="◎"
                  title="Track five entries"
                  text="Build a more complete sample before drawing conclusions."
                  done={entries.length >= 5}
                  progress={Math.min(entries.length, 5) + ' / 5'}
                />
                <Challenge
                  icon="▣"
                  title="Review the numbers"
                  text="Visit your Insights lab and consider the sample size."
                  done={Boolean(insight)}
                  progress={insight ? 'Complete' : 'Not started'}
                />
                <Challenge
                  icon="♡"
                  title="Set a personal limit"
                  text="Choose a weekly tracking limit in Safer play."
                  done={Boolean(weeklyLimit)}
                  progress={weeklyLimit ? 'Set' : 'Not set'}
                />
              </div>
              <section className="panel">
                <p className="eyebrow">YOUR PROGRESS</p>
                <h2>
                  {entries.length >= 5
                    ? 'Nice work building a record.'
                    : 'Small steps count.'}
                </h2>
                <p className="muted">
                  Progress is based on learning and record-keeping activity
                  only. It is not a measure of betting success.
                </p>
              </section>
            </>
          )}

          {section === 'Safer play' && (
            <>
              <PageHeading
                eyebrow="LOOK AFTER YOURSELF FIRST"
                title="Safer play"
                text="Set boundaries before you start. Taking a break or choosing not to bet are always valid choices."
              />
              <BankrollControls entries={entries} />
              <section className="panel limit-panel">
                <div>
                  <p className="eyebrow">PERSONAL TRACKING LIMIT</p>
                  <h2>Choose a weekly stake ceiling</h2>
                  <p className="muted">
                    This is a reminder based on entries you record here. It does
                    not block betting or monitor activity outside this tracker.
                  </p>
                </div>
                <label className="limit-input">
                  Weekly limit (AUD)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={weeklyLimit}
                    onChange={e => setWeeklyLimit(e.target.value)}
                  />
                </label>
                <div className="limit-progress">
                  <div className="progress-label">
                    <span>Recorded in the last 7 days</span>
                    <strong>
                      {money(weeklyStake)} /{' '}
                      {money(Math.max(0, Number(weeklyLimit) || 0))}
                    </strong>
                  </div>
                  <div className="progress-track">
                    <span
                      style={{
                        width:
                          Math.min(
                            100,
                            weeklyLimit && Number(weeklyLimit) > 0
                              ? (weeklyStake / Number(weeklyLimit)) * 100
                              : 0
                          ) + '%',
                      }}
                    />
                  </div>
                </div>
                {Number(weeklyLimit) > 0 &&
                  weeklyStake > Number(weeklyLimit) && (
                    <p className="warning-message">
                      Your recorded stakes are above the limit you set. Consider
                      stopping and reviewing your boundary.
                    </p>
                  )}
              </section>
              <div className="support-grid">
                <article className="support-card">
                  <span>🇦🇺</span>
                  <h2>Gambling Help Online</h2>
                  <p>
                    Free, confidential support in Australia, available 24/7.
                  </p>
                  <a
                    href="https://www.gamblinghelponline.org.au/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit Gambling Help Online ↗
                  </a>
                </article>
                <article className="support-card">
                  <span>☎</span>
                  <h2>National support line</h2>
                  <p>
                    Call 1800 858 858 for free gambling support in Australia.
                  </p>
                  <a
                    href="https://www.gamblinghelponline.org.au/get-help/talk-to-someone"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Find support options ↗
                  </a>
                </article>
              </div>
              <p className="small-note">
                If gambling is causing stress, financial pressure or conflict,
                pause and speak with someone you trust or a support service.
                This app is not a gambling treatment service.
              </p>
            </>
          )}
          <footer className="footer">
            <span>PUNTERS HQ · DEMO EDITION</span>
            <span>Track thoughtfully. Know your limits.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Main navigation">
        {nav.map(item => (
          <button
            key={item}
            className={section === item ? 'mobile-active' : ''}
            onClick={() => setSection(item)}
          >
            <span>
              {
                (
                  {
                    Home: '⌂',
                    Tracker: '▤',
                    Insights: '◈',
                    'Race tools': '♧',
                    'Race Centre': '🏇',
                    Learn: '▣',
                    Challenges: '✦',
                    'Safer play': '♡',
                  } as Record<Section, string>
                )[item]
              }
            </span>
            <small>{item === 'Safer play' ? 'Safer' : item}</small>
          </button>
        ))}
      </nav>
      {showConfetti && (
        <div className="confetti" aria-hidden="true">
          ✦　✧　✦　✧　✦
        </div>
      )}
    </div>
  );
}

type RaceNote = {
  id: string;
  title: string;
  meeting: string;
  race: string;
  track: string;
  date: string;
  content: string;
};

const NOTES_KEY = 'punters-hq-race-notes-v1';
const BANKROLL_KEY = 'punters-hq-bankroll-v1';
const DAILY_LIMIT_KEY = 'punters-hq-daily-limit-v1';

function readRaceNotes(): RaceNote[] {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? (JSON.parse(saved) as RaceNote[]) : [];
  } catch {
    return [];
  }
}

function OddsComparison() {
  const bookmakers = ['Sportsbet', 'TAB', 'Ladbrokes', 'Bet365', 'Unibet'];
  const [selection, setSelection] = useState('');
  const [prices, setPrices] = useState<Record<string, string>>({
    Sportsbet: '',
    TAB: '',
    Ladbrokes: '',
    Bet365: '',
    Unibet: '',
  });
  const valid = bookmakers
    .map(name => ({ name, price: Number(prices[name]) }))
    .filter(
      item =>
        prices[item.name].trim() !== '' &&
        Number.isFinite(item.price) &&
        item.price >= 1
    );
  const best = valid.length
    ? valid.reduce((top, item) => (item.price > top.price ? item : top))
    : null;

  return (
    <section className="panel">
      <p className="eyebrow">MANUAL PRICE CHECK</p>
      <h2>Compare bookmaker odds</h2>
      <label className="limit-input">
        Horse or selection
        <input
          value={selection}
          onChange={e => setSelection(e.target.value)}
          placeholder="Enter selection name"
        />
      </label>
      {bookmakers.map(name => (
        <label className="limit-input" key={name}>
          {name} decimal odds
          <input
            type="number"
            min="1"
            step="0.01"
            value={prices[name]}
            onChange={e =>
              setPrices(current => ({ ...current, [name]: e.target.value }))
            }
            placeholder="Leave blank if unavailable"
          />
        </label>
      ))}
      {best ? (
        <div className="notice" role="status">
          <span>✓</span>
          <div>
            <strong>
              Best entered price: {best.name} — {best.price.toFixed(2)}
            </strong>
            <p>
              {selection.trim() || 'Selection not named'} · Compared{' '}
              {valid.length} entered price{valid.length === 1 ? '' : 's'}.
              Prices are manually entered, not live bookmaker feeds.
            </p>
          </div>
        </div>
      ) : (
        <p className="small-note">
          Enter at least one valid decimal price of 1.00 or higher.
        </p>
      )}
      <button
        className="secondary-button full-button"
        type="button"
        onClick={() => {
          setSelection('');
          setPrices({
            Sportsbet: '',
            TAB: '',
            Ladbrokes: '',
            Bet365: '',
            Unibet: '',
          });
        }}
      >
        Clear comparison
      </button>
    </section>
  );
}

function EachWayCalculator() {
  const [stake, setStake] = useState('10');
  const [odds, setOdds] = useState('5.00');
  const [fraction, setFraction] = useState('0.25');
  const [outcome, setOutcome] = useState<'win' | 'place' | 'lose'>('win');
  const amount = Number(stake);
  const price = Number(odds);
  const placeFraction = Number(fraction);
  const valid =
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isFinite(price) &&
    price >= 1 &&
    Number.isFinite(placeFraction) &&
    placeFraction > 0 &&
    placeFraction <= 1;
  const halfStake = valid ? amount / 2 : 0;
  const placeOdds = valid ? 1 + (price - 1) * placeFraction : 0;
  const grossReturn =
    !valid || outcome === 'lose'
      ? 0
      : outcome === 'win'
        ? halfStake * price + halfStake * placeOdds
        : halfStake * placeOdds;
  const net = grossReturn - (valid ? amount : 0);

  return (
    <section className="panel">
      <p className="eyebrow">EACH-WAY ESTIMATE</p>
      <h2>Each-way calculator</h2>
      <p className="small-note">
        Enter the total stake. The calculator splits it equally between win and
        place parts.
      </p>
      <label className="limit-input">
        Total stake (AUD)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={stake}
          onChange={e => setStake(e.target.value)}
        />
      </label>
      <label className="limit-input">
        Win decimal odds
        <input
          type="number"
          min="1"
          step="0.01"
          value={odds}
          onChange={e => setOdds(e.target.value)}
        />
      </label>
      <label className="limit-input">
        Place fraction
        <select value={fraction} onChange={e => setFraction(e.target.value)}>
          <option value="0.25">1/4 of win odds</option>
          <option value="0.2">1/5 of win odds</option>
          <option value="0.5">1/2 of win odds</option>
        </select>
      </label>
      <label className="limit-input">
        Example outcome
        <select
          value={outcome}
          onChange={e => setOutcome(e.target.value as 'win' | 'place' | 'lose')}
        >
          <option value="win">Wins (win and place parts return)</option>
          <option value="place">Places only (place part returns)</option>
          <option value="lose">Unplaced (no return)</option>
        </select>
      </label>
      <div className="number-list">
        <NumberLine
          label="Place decimal odds used"
          value={valid ? placeOdds.toFixed(2) : 'Check inputs'}
        />
        <NumberLine
          label="Illustrative gross return"
          value={valid ? money(grossReturn) : '—'}
        />
        <NumberLine
          label="Illustrative net result"
          value={valid ? money(net) : '—'}
        />
      </div>
      <p className="small-note">
        Illustration only. Actual bookmaker place terms, deductions, dead heats
        and settlement rules vary. Confirm the specific market terms before
        relying on a calculation.
      </p>
    </section>
  );
}

function RaceNotebook() {
  const [notes, setNotes] = useState<RaceNote[]>(readRaceNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [meeting, setMeeting] = useState('');
  const [race, setRace] = useState('');
  const [track, setTrack] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const reset = () => {
    setEditingId(null);
    setTitle('');
    setMeeting('');
    setRace('');
    setTrack('');
    setContent('');
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage('Add a note title and some observations before saving.');
      return;
    }
    const note: RaceNote = {
      id: editingId || String(Date.now()) + Math.random().toString(16).slice(2),
      title: title.trim(),
      meeting: meeting.trim(),
      race: race.trim(),
      track: track.trim(),
      date: new Date().toISOString(),
      content: content.trim(),
    };
    setNotes(current =>
      editingId
        ? current.map(item => (item.id === editingId ? note : item))
        : [note, ...current]
    );
    setMessage(
      editingId ? 'Note updated on this device.' : 'Note saved on this device.'
    );
    reset();
  };

  const edit = (note: RaceNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setMeeting(note.meeting);
    setRace(note.race);
    setTrack(note.track);
    setContent(note.content);
    setMessage('');
  };

  const remove = (id: string) => {
    if (window.confirm('Delete this racing note?')) {
      setNotes(current => current.filter(item => item.id !== id));
    }
  };

  return (
    <section className="panel">
      <p className="eyebrow">YOUR OWN RACE NOTES</p>
      <h2>Racing notebook</h2>
      <form className="entry-form" onSubmit={save}>
        <label>
          Note title
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Flemington track observations"
          />
        </label>
        <div className="form-two">
          <label>
            Meeting
            <input
              value={meeting}
              onChange={e => setMeeting(e.target.value)}
              placeholder="Track / meeting"
            />
          </label>
          <label>
            Race
            <input
              value={race}
              onChange={e => setRace(e.target.value)}
              placeholder="Race number"
            />
          </label>
        </div>
        <label>
          Track condition
          <input
            value={track}
            onChange={e => setTrack(e.target.value)}
            placeholder="e.g. Soft 5 — verify officially"
          />
        </label>
        <label>
          Observations
          <textarea
            rows={5}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Pace map, barriers, scratchings to verify, observations and post-race review..."
          />
        </label>
        <button className="primary-button full-button" type="submit">
          {editingId ? 'Update note' : 'Save racing note'}
        </button>
        {editingId && (
          <button
            className="secondary-button full-button"
            type="button"
            onClick={reset}
          >
            Cancel editing
          </button>
        )}
        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </form>
      <p className="small-note">
        Notes are saved in this browser on this device and remain after refresh.
        They do not sync automatically to another phone or computer. Notes are
        included in the full backup file, which you can restore on another device.
      </p>
      {notes.length === 0 ? (
        <EmptyState
          title="No saved racing notes yet"
          text="Your dated meeting and race observations will appear here."
        />
      ) : (
        <div className="recent-list">
          {notes.map(note => (
            <article className="recent-row" key={note.id}>
              <div>
                <strong>{note.title}</strong>
                <small>
                  {[note.meeting, note.race, note.track]
                    .filter(Boolean)
                    .join(' · ') || 'General racing note'}{' '}
                  · {new Date(note.date).toLocaleDateString('en-AU')}
                </small>
                <p>{note.content}</p>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => edit(note)}
                >
                  Edit
                </button>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => remove(note.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function BankrollControls({ entries }: { entries: Entry[] }) {
  const [starting, setStarting] = useState(
    () => localStorage.getItem(BANKROLL_KEY) || '500'
  );
  const [dailyLimit, setDailyLimit] = useState(
    () => localStorage.getItem(DAILY_LIMIT_KEY) || '25'
  );

  useEffect(() => {
    localStorage.setItem(BANKROLL_KEY, starting);
  }, [starting]);

  useEffect(() => {
    localStorage.setItem(DAILY_LIMIT_KEY, dailyLimit);
  }, [dailyLimit]);

  const todayKey = new Date().toDateString();
  const todayStake = entries
    .filter(item => new Date(item.date).toDateString() === todayKey)
    .reduce((sum, item) => sum + item.stake, 0);
  const settledNet = entries
    .filter(item => item.result !== 'Pending')
    .reduce(
      (sum, item) =>
        sum +
        (item.result === 'Won'
          ? item.stake * item.odds - item.stake
          : -item.stake),
      0
    );
  const currentBankroll = Number(starting) + settledNet;
  const dailyValue = Number(dailyLimit) || 0;

  return (
    <section className="panel limit-panel">
      <p className="eyebrow">BANKROLL OVERVIEW</p>
      <h2>Starting balance and daily boundary</h2>
      <p className="muted">
        These figures are calculated only from entries you record here. They do
        not connect to bookmaker accounts or block activity elsewhere.
      </p>
      <div className="form-two">
        <label className="limit-input">
          Starting bankroll (AUD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={starting}
            onChange={e => setStarting(e.target.value)}
          />
        </label>
        <label className="limit-input">
          Daily tracking limit (AUD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={dailyLimit}
            onChange={e => setDailyLimit(e.target.value)}
          />
        </label>
      </div>
      <div className="number-list">
        <NumberLine
          label="Illustrative current bankroll"
          value={money(currentBankroll)}
        />
        <NumberLine label="Recorded stakes today" value={money(todayStake)} />
        <NumberLine
          label="Daily limit remaining"
          value={money(Math.max(0, dailyValue - todayStake))}
        />
      </div>
      {dailyValue > 0 && todayStake > dailyValue && (
        <p className="warning-message">
          Recorded stakes are above your daily limit. Pause and review your
          boundary.
        </p>
      )}
      {currentBankroll < 0 && (
        <p className="warning-message">
          Recorded net losses exceed the starting balance. Do not chase losses.
        </p>
      )}
      <p className="small-note">
        A planning and record-keeping aid only — not a real account balance,
        financial advice or a control over external betting.
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong className={positive === false ? 'negative' : ''}>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="subheading">{text}</p>
    </section>
  );
}

function EmptyState({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty-state">
      <span>▤</span>
      <strong>{title}</strong>
      <p>{text}</p>
      {action && onClick && (
        <button className="text-link" onClick={onClick}>
          {action} →
        </button>
      )}
    </div>
  );
}

function NumberLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="number-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Challenge({
  icon,
  title,
  text,
  done,
  progress,
}: {
  icon: string;
  title: string;
  text: string;
  done: boolean;
  progress: string;
}) {
  return (
    <article className="challenge-card">
      <div className="challenge-top">
        <span className="challenge-icon">{icon}</span>
        <span className={done ? 'achievement done' : 'achievement'}>
          {done ? '✓ Earned' : 'In progress'}
        </span>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <strong className="challenge-progress">{progress}</strong>
    </article>
  );
}

export default App;
