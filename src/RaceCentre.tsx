import { useEffect, useMemo, useState } from 'react';
import { api } from '@appdeploy/client';

type Runner = {
  id: string;
  name: string;
  barrier: string;
  jockey: string;
  trainer: string;
  weight: string;
  recentForm: string;
  runningStyle: string;
  rating: string;
  notes: string;
};

type RaceCard = {
  id: string;
  meeting: string;
  venue: string;
  raceNumber: string;
  date: string;
  distance: string;
  trackCondition: string;
  railPosition: string;
  sourceNote: string;
  updatedAt: string;
  runners: Runner[];
};

const RACE_CENTRE_KEY = 'punters-hq-race-centre-v1';
const PROVIDER_SETUP_KEY = 'punters-hq-provider-setup-v1';

const providerSetupSteps = [
  { id: 'commercial', title: 'Commercial agreement and quote', detail: 'Confirm pricing, setup fees, minimum term, support and termination terms.' },
  { id: 'rights', title: 'Data rights and permitted use', detail: 'Get written permission for public display, commercial redistribution, storage, derived ratings, historical retention and caching.' },
  { id: 'coverage', title: 'Australian coverage and feed schedule', detail: 'Confirm thoroughbred coverage, jurisdictions, fields, scratchings, results, odds, sectionals, speed maps and update timing.' },
  { id: 'sandbox', title: 'Sandbox and technical pack', detail: 'Obtain current schema, sample queries, UAT endpoint, test credentials, support contact and change-notice process.' },
  { id: 'production', title: 'Production credentials and endpoints', detail: 'Receive the production client ID, client secret, OAuth endpoint and API endpoint after approval.' },
  { id: 'mapping', title: 'Field mapping and data validation', detail: 'Map provider IDs, meetings, races, runners, scratchings, prices, timestamps and results to Punters HQ records.' },
  { id: 'recovery', title: 'Live update and recovery rules', detail: 'Implement token renewal, WebSocket reconnect, missed-update backfill, rate-limit handling and stale-data warnings.' },
  { id: 'acceptance', title: 'Commercial and technical acceptance', detail: 'Test a full meeting, changed fields, scratchings, abandoned races, dead heats, outages and mobile display before launch.' },
];

function readProviderSetup(): string[] {
  try {
    const saved = localStorage.getItem(PROVIDER_SETUP_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

type RacingConnectionStatus = {
  status: 'not_configured' | 'connected';
  provider: string | null;
  contractVersion: string;
  supportedFeeds: string[];
  lastSuccessfulSync: string | null;
  message: string;
};

function readRaceCards(): RaceCard[] {
  try {
    const saved = localStorage.getItem(RACE_CENTRE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed as RaceCard[] : [];
  } catch {
    return [];
  }
}

function makeId() {
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

export default function RaceCentre() {
  const [cards, setCards] = useState<RaceCard[]>(readRaceCards);
  const [connectionStatus, setConnectionStatus] = useState<RacingConnectionStatus | null>(null);
  const [connectionStatusError, setConnectionStatusError] = useState('');
  const [providerSetupDone, setProviderSetupDone] = useState<string[]>(readProviderSetup);
  const [selectedId, setSelectedId] = useState('');
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [showRunnerForm, setShowRunnerForm] = useState(false);
  const [message, setMessage] = useState('');
  const [meeting, setMeeting] = useState('');
  const [venue, setVenue] = useState('');
  const [raceNumber, setRaceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [distance, setDistance] = useState('');
  const [trackCondition, setTrackCondition] = useState('');
  const [railPosition, setRailPosition] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [runnerName, setRunnerName] = useState('');
  const [barrier, setBarrier] = useState('');
  const [jockey, setJockey] = useState('');
  const [trainer, setTrainer] = useState('');
  const [weight, setWeight] = useState('');
  const [recentForm, setRecentForm] = useState('');
  const [runningStyle, setRunningStyle] = useState('Unknown');
  const [rating, setRating] = useState('');
  const [runnerNotes, setRunnerNotes] = useState('');

  useEffect(() => {
    localStorage.setItem(RACE_CENTRE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(PROVIDER_SETUP_KEY, JSON.stringify(providerSetupDone));
  }, [providerSetupDone]);

  const toggleProviderStep = (stepId: string) => {
    setProviderSetupDone(current => current.includes(stepId)
      ? current.filter(item => item !== stepId)
      : [...current, stepId]);
  };

  useEffect(() => {
    let active = true;
    api.get('/api/racing-data/status')
      .then(response => {
        if (active) setConnectionStatus(response.data as RacingConnectionStatus);
      })
      .catch(() => {
        if (active) setConnectionStatusError('Connection status could not be checked. Your saved race files are unaffected.');
      });
    return () => { active = false; };
  }, []);

  const selectedRace = cards.find(card => card.id === selectedId) || cards[0] || null;

  useEffect(() => {
    if (selectedRace && selectedId !== selectedRace.id) {
      setSelectedId(selectedRace.id);
    }
  }, [selectedRace, selectedId]);

  const sortedRunners = useMemo(() => {
    if (!selectedRace) return [];
    return [...selectedRace.runners].sort((a, b) => {
      const ratingA = Number(a.rating);
      const ratingB = Number(b.rating);
      if (a.rating.trim() && b.rating.trim() && ratingA !== ratingB) {
        return ratingB - ratingA;
      }
      if (a.rating.trim() && !b.rating.trim()) return -1;
      if (!a.rating.trim() && b.rating.trim()) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedRace]);

  const paceSummary = useMemo(() => {
    if (!selectedRace) return [];
    const styles = ['Leader', 'On pace', 'Midfield', 'Backmarker', 'Unknown'];
    return styles.map(style => ({
      style,
      count: selectedRace.runners.filter(runner => runner.runningStyle === style).length,
    })).filter(item => item.count > 0);
  }, [selectedRace]);

  const dataQuality = useMemo(() => {
    if (!selectedRace) return { issues: [] as string[], duplicateNames: [] as string[], completeness: 0 };
    const issues: string[] = [];
    const requiredRaceFields = [
      ['Meeting', selectedRace.meeting],
      ['Venue', selectedRace.venue],
      ['Race number', selectedRace.raceNumber],
      ['Race date', selectedRace.date],
      ['Distance', selectedRace.distance],
      ['Track condition', selectedRace.trackCondition],
      ['Rail position', selectedRace.railPosition],
      ['Information source', selectedRace.sourceNote],
    ] as const;
    requiredRaceFields.forEach(([label, value]) => {
      if (!String(value || '').trim()) issues.push('Missing ' + label.toLowerCase());
    });
    if (selectedRace.runners.length === 0) issues.push('No runners have been entered');
    const names = selectedRace.runners.map(runner => runner.name.trim().toLocaleLowerCase()).filter(Boolean);
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicateNames.length) issues.push('Possible duplicate runner names found');
    const incompleteRunnerCount = selectedRace.runners.filter(runner =>
      !runner.barrier.trim() || !runner.jockey.trim() || !runner.trainer.trim() ||
      !runner.weight.trim() || !runner.recentForm.trim()
    ).length;
    if (incompleteRunnerCount) issues.push(incompleteRunnerCount + ' runner record(s) have one or more blank detail fields');
    const checkedCount = requiredRaceFields.filter(([, value]) => String(value || '').trim()).length;
    const completeness = Math.round((checkedCount / requiredRaceFields.length) * 100);
    return { issues, duplicateNames: [...new Set(duplicateNames)], completeness };
  }, [selectedRace]);

  const runnerComparison = useMemo(() => {
    if (!selectedRace) return { rated: [] as Runner[], average: null as number | null, highest: null as Runner | null, lowest: null as Runner | null, unscored: 0 };
    const rated = selectedRace.runners
      .filter(runner => runner.rating.trim() !== '' && Number.isFinite(Number(runner.rating)))
      .sort((a, b) => Number(b.rating) - Number(a.rating));
    const total = rated.reduce((sum, runner) => sum + Number(runner.rating), 0);
    return {
      rated,
      average: rated.length ? total / rated.length : null,
      highest: rated[0] || null,
      lowest: rated[rated.length - 1] || null,
      unscored: selectedRace.runners.length - rated.length,
    };
  }, [selectedRace]);

  const resetRaceForm = () => {
    setMeeting('');
    setVenue('');
    setRaceNumber('');
    setDate(new Date().toISOString().slice(0, 10));
    setDistance('');
    setTrackCondition('');
    setRailPosition('');
    setSourceNote('');
  };

  const saveRace = (event: React.FormEvent) => {
    event.preventDefault();
    if (!meeting.trim() || !venue.trim() || !raceNumber.trim() || !date) {
      setMessage('Add the meeting, venue, race number and date before saving.');
      return;
    }
    const card: RaceCard = {
      id: makeId(),
      meeting: meeting.trim(),
      venue: venue.trim(),
      raceNumber: raceNumber.trim(),
      date,
      distance: distance.trim(),
      trackCondition: trackCondition.trim(),
      railPosition: railPosition.trim(),
      sourceNote: sourceNote.trim() || 'Manually entered by user',
      updatedAt: new Date().toISOString(),
      runners: [],
    };
    setCards(current => [card, ...current]);
    setSelectedId(card.id);
    setShowRaceForm(false);
    setMessage('Race workspace saved on this device.');
    resetRaceForm();
  };

  const resetRunnerForm = () => {
    setRunnerName('');
    setBarrier('');
    setJockey('');
    setTrainer('');
    setWeight('');
    setRecentForm('');
    setRunningStyle('Unknown');
    setRating('');
    setRunnerNotes('');
  };

  const saveRunner = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRace) return;
    if (!runnerName.trim()) {
      setMessage('Enter the horse name before adding a runner.');
      return;
    }
    const runner: Runner = {
      id: makeId(),
      name: runnerName.trim(),
      barrier: barrier.trim(),
      jockey: jockey.trim(),
      trainer: trainer.trim(),
      weight: weight.trim(),
      recentForm: recentForm.trim(),
      runningStyle,
      rating: rating.trim(),
      notes: runnerNotes.trim(),
    };
    setCards(current => current.map(card => card.id === selectedRace.id
      ? { ...card, runners: [...card.runners, runner], updatedAt: new Date().toISOString() }
      : card));
    setShowRunnerForm(false);
    setMessage('Runner added to this race workspace.');
    resetRunnerForm();
  };

  const removeRunner = (runnerId: string) => {
    if (!selectedRace || !window.confirm('Remove this runner from the saved race?')) return;
    setCards(current => current.map(card => card.id === selectedRace.id
      ? { ...card, runners: card.runners.filter(runner => runner.id !== runnerId), updatedAt: new Date().toISOString() }
      : card));
  };

  const removeRace = (raceId: string) => {
    if (!window.confirm('Delete this race workspace and its runner records? This cannot be undone.')) return;
    setCards(current => current.filter(card => card.id !== raceId));
    setSelectedId('');
    setMessage('Race workspace deleted.');
  };

  const exportRace = () => {
    if (!selectedRace) return;
    const blob = new Blob([JSON.stringify(selectedRace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'punters-hq-race-workspace.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="race-centre">
      <PageHeading
        eyebrow="AUSTRALIAN THOROUGHBRED WORKSPACE"
        title="Race Centre"
        text="Build one organised race file for the meeting, runners, form observations and pace notes. This is the foundation for future licensed live-data connections."
      />

      <div className="race-data-notice">
        <strong>Manual workspace — not live racing data</strong>
        <p>Race and runner details entered here are saved in this browser on this device. No live fields, scratchings, track conditions, prices or results are connected yet.</p>
      </div>

      <section className="race-provider-panel" aria-live="polite">
        <div>
          <span className="race-status-label">RACING DATA CONNECTION</span>
          <strong>{connectionStatus?.status === 'connected' ? connectionStatus.provider + ' connection reported' : connectionStatus ? 'No authorised racing provider connected' : 'Checking connection status…'}</strong>
          <p>{connectionStatusError || connectionStatus?.message || 'Checking the secure provider connection status.'}</p>
          <p className="race-feed-list">Prepared feed categories: {connectionStatus?.supportedFeeds.join(' · ') || 'Checking available categories'}</p>
          <p className="race-feed-list">Last successful sync: {connectionStatus?.lastSuccessfulSync ? new Date(connectionStatus.lastSuccessfulSync).toLocaleString('en-AU') : 'None recorded'}</p>
        </div>
        <span className="race-status-pill">{connectionStatus?.status === 'connected' ? 'CONNECTED' : connectionStatusError ? 'STATUS UNKNOWN' : connectionStatus ? 'NOT CONNECTED' : 'CHECKING'}</span>
      </section>

      <section className="panel provider-onboarding-panel">
        <div className="provider-onboarding-heading">
          <div>
            <p className="eyebrow">PHASE 2 · PROVIDER ONBOARDING</p>
            <h2>BetMakers CoreAPI integration</h2>
            <p className="muted">Recommended provider to approach first for official Australian racing materials and additional form and analytics products. This is a preparation checklist, not a connected feed.</p>
          </div>
          <span className="provider-progress">{providerSetupDone.length}/{providerSetupSteps.length} complete</span>
        </div>
        <div className="provider-progress-track"><span style={{ width: (providerSetupDone.length / providerSetupSteps.length * 100) + '%' }} /></div>
        <p className="provider-warning"><strong>Nothing has been purchased or connected.</strong> Tick an item only after it has actually been confirmed. Progress is saved in this browser on this device and is not a provider approval record.</p>
        <div className="provider-checklist">
          {providerSetupSteps.map(step => (
            <label className="provider-check-item" key={step.id}>
              <input type="checkbox" checked={providerSetupDone.includes(step.id)} onChange={() => toggleProviderStep(step.id)} />
              <span><strong>{step.title}</strong><small>{step.detail}</small></span>
            </label>
          ))}
        </div>
        <div className="provider-tech-notes">
          <h3>Technical requirements identified in BetMakers' published CoreAPI documentation</h3>
          <ul>
            <li>OAuth 2.0 client-credentials access using a client ID and client secret.</li>
            <li>Provider-issued OAuth endpoint and API endpoint; GraphQL requests use the provider endpoint's <code>/query</code> path.</li>
            <li>Published documentation describes GraphQL queries and WebSocket subscriptions for updates.</li>
            <li>The published FAQ states access tokens last one hour, queries are throttled at 10 per second, and disconnected subscriptions should be re-queried and restarted with backoff.</li>
            <li>There is no token refresh. When a token expires, request a new one with the same client credentials, from a server only.</li>
            <li>Query results are capped at 4 MB, the meetingsDated query covers at most 5 days, and some heavy fields (such as form history and runner statistics) can trigger 429 errors if requested in bulk.</li>
            <li>The test environment is limited: dummy credentials and only some Queensland meetings and VIC Tote prices. Production needs real OAuth credentials issued by BetMakers.</li>
            <li>BetMakers has been appointed Racing Australia's data wholesaler. Ask which official-data terms apply to a public app like this one.</li>
            <li>Support contact in the documentation: support-api@betmakers.com.</li>
          </ul>
          <p className="small-note">These are published technical notes, not a guarantee that every product or feed is included in a Punters HQ commercial package. Confirm the current production specification with BetMakers before implementation.</p>
        </div>
        <div className="provider-resource-links">
          <a href="https://docs.betmakers.com/docs/core-api/auth/index.html" target="_blank" rel="noreferrer">CoreAPI authentication documentation ↗</a>
          <a href="https://docs.betmakers.com/docs/core-api/faq/index.html" target="_blank" rel="noreferrer">CoreAPI technical FAQ ↗</a>
          <a href="https://docs.betmakers.com/docs/overview" target="_blank" rel="noreferrer">BetMakers documentation overview ↗</a>
          <a href="https://docs.betmakers.com/docs/core-api/introduction" target="_blank" rel="noreferrer">CoreAPI introduction and limits ↗</a>
          <a href="https://docs.betmakers.com/docs/core-api/Changelog" target="_blank" rel="noreferrer">CoreAPI changelog ↗</a>
          <a href="https://docs.betmakers.com/docs/core-api/troubleshooting" target="_blank" rel="noreferrer">CoreAPI troubleshooting ↗</a>
          <a href="mailto:support-api@betmakers.com">Email BetMakers API support</a>
          <a href="https://betmakers.com/solutions/data" target="_blank" rel="noreferrer">Data and analytics products ↗</a>
          <a href="https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler" target="_blank" rel="noreferrer">Racing Australia data wholesaler news ↗</a>
          <a href="https://www.gaming.net/tabcorp-agrees-binding-deal-to-acquire-wagering-tech-firm-betmakers/" target="_blank" rel="noreferrer">Tabcorp acquisition report ↗</a>
          <a href="https://igamingbusiness.com/strategy/tabcorp-to-acquire-betmakers-in-267-million-deal/" target="_blank" rel="noreferrer">Tabcorp acquisition report (second source) ↗</a>
        </div>
        <p className="small-note">Ownership caveat: Tabcorp signed a binding agreement on 10 August 2026 to acquire BetMakers, reported at A$0.24 per share (about A$267 million). It still needs BetMakers shareholder, court and ACCC approval. A shareholder meeting was targeted for December 2026 and completion for the third quarter of Tabcorp's 2027 financial year. Status last checked 2 November 2026 and may have changed. Before signing anything, ask who the contracting company is, what happens to your price, data rights and support if ownership changes, and whether you can leave without penalty. Tabcorp is itself a bookmaker, so also ask how your usage data is handled.</p>
        <p className="provider-security-note"><strong>Credential safety:</strong> Never paste API secrets (client ID, client secret, tokens) into this checklist, race notes, chat, email or screenshots. This app does not ask for them and has none stored. If a commercial agreement is approved, credentials must go only into encrypted backend secret storage, never the visible screen or browser storage. Keep test and production credentials separate, give them to as few people as possible, and if one is ever exposed, tell BetMakers and have it replaced straight away.</p>
      </section>

      <div className="race-centre-toolbar">
        <div>
          <p className="eyebrow">YOUR SAVED RACE FILES</p>
          <h2>Race workspaces</h2>
        </div>
        <button className="primary-button" type="button" onClick={() => { setShowRaceForm(value => !value); setMessage(''); }}>
          {showRaceForm ? 'Close form' : '＋ Create race'}
        </button>
      </div>

      {showRaceForm && (
        <section className="panel race-form-panel">
          <h2>Create a race workspace</h2>
          <p className="small-note">Enter the details from a source you are entitled to use. Record where the information came from so it can be checked later.</p>
          <form className="entry-form" onSubmit={saveRace}>
            <div className="race-form-grid">
              <label>Meeting name<input value={meeting} onChange={event => setMeeting(event.target.value)} placeholder="e.g. Saturday metropolitan meeting" /></label>
              <label>Venue<input value={venue} onChange={event => setVenue(event.target.value)} placeholder="e.g. Flemington" /></label>
              <label>Race number<input value={raceNumber} onChange={event => setRaceNumber(event.target.value)} placeholder="e.g. 5" /></label>
              <label>Race date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
              <label>Distance (metres)<input type="number" min="0" value={distance} onChange={event => setDistance(event.target.value)} placeholder="e.g. 1400" /></label>
              <label>Track condition<input value={trackCondition} onChange={event => setTrackCondition(event.target.value)} placeholder="e.g. Good 4 — verify source" /></label>
              <label>Rail position<input value={railPosition} onChange={event => setRailPosition(event.target.value)} placeholder="e.g. True / +4m" /></label>
              <label className="race-source-field">Information source / reference<input value={sourceNote} onChange={event => setSourceNote(event.target.value)} placeholder="e.g. Official field PDF, accessed 8:30 am" /></label>
            </div>
            <button className="primary-button full-button" type="submit">Save race workspace</button>
          </form>
        </section>
      )}

      {message && <p className="form-message" role="status">{message}</p>}

      {cards.length === 0 ? (
        <section className="panel">
          <EmptyState title="Your Race Centre is ready" text="Create your first race workspace. Add runners and your own form observations to build a structured race file." action="Create first race" onClick={() => setShowRaceForm(true)} />
        </section>
      ) : (
        <div className="race-centre-layout">
          <section className="panel race-list-panel">
            <div className="panel-heading">
              <h2>Saved races</h2>
              <span className="sample-tag">{cards.length} SAVED</span>
            </div>
            {cards.map(card => (
              <button key={card.id} type="button" className={selectedRace?.id === card.id ? 'race-list-item selected' : 'race-list-item'} onClick={() => setSelectedId(card.id)}>
                <span className="race-list-date">{new Date(card.date + 'T00:00:00').toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <strong>{card.venue} · R{card.raceNumber}</strong>
                <small>{card.meeting} · {card.runners.length} runner{card.runners.length === 1 ? '' : 's'}</small>
              </button>
            ))}
          </section>

          {selectedRace && (
            <section className="panel race-detail-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">RACE FILE · MANUAL ENTRY</p>
                  <h2>{selectedRace.venue} · Race {selectedRace.raceNumber}</h2>
                  <p className="muted">{selectedRace.meeting} · {new Date(selectedRace.date + 'T00:00:00').toLocaleDateString('en-AU')}</p>
                </div>
                <button className="text-link" type="button" onClick={exportRace}>Export race file ↓</button>
              </div>
              <div className="race-meta-grid">
                <div><small>DISTANCE</small><strong>{selectedRace.distance ? selectedRace.distance + 'm' : 'Not entered'}</strong></div>
                <div><small>TRACK</small><strong>{selectedRace.trackCondition || 'Not entered'}</strong></div>
                <div><small>RAIL</small><strong>{selectedRace.railPosition || 'Not entered'}</strong></div>
                <div><small>RUNNERS</small><strong>{selectedRace.runners.length}</strong></div>
              </div>
              <p className="race-source-line"><strong>Source:</strong> {selectedRace.sourceNote} <span>· Updated {new Date(selectedRace.updatedAt).toLocaleString('en-AU')}</span></p>

              <section className="race-quality-panel" aria-live="polite">
                <div className="race-quality-heading">
                  <div>
                    <p className="eyebrow">DATA READINESS CHECK</p>
                    <h3>{dataQuality.issues.length === 0 ? 'No completeness gaps detected' : 'Review this race file'}</h3>
                    <p>Race-detail completeness: {dataQuality.completeness}%</p>
                  </div>
                  <span className={dataQuality.issues.length === 0 ? 'quality-status quality-clear' : 'quality-status quality-review'}>
                    {dataQuality.issues.length === 0 ? 'READY TO REVIEW' : dataQuality.issues.length + ' ITEMS TO CHECK'}
                  </span>
                </div>
                {dataQuality.issues.length > 0 ? (
                  <ul>{dataQuality.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
                ) : (
                  <p className="quality-clear-note">The basic race fields are populated and no obvious duplicate runner names were detected.</p>
                )}
                {dataQuality.duplicateNames.length > 0 && (
                  <p className="quality-duplicate-note">Possible duplicates: {dataQuality.duplicateNames.join(', ')}</p>
                )}
                <p className="quality-disclaimer">This checks whether information has been entered consistently. It does not verify facts against an official source, confirm field accuracy or replace licensed data validation.</p>
              </section>

              <div className="race-centre-toolbar runner-toolbar">
                <div>
                  <p className="eyebrow">FIELD BUILDER</p>
                  <h2>Runners</h2>
                </div>
                <button className="secondary-button" type="button" onClick={() => setShowRunnerForm(value => !value)}>{showRunnerForm ? 'Close' : '＋ Add runner'}</button>
              </div>

              {showRunnerForm && (
                <form className="entry-form runner-form" onSubmit={saveRunner}>
                  <label>Horse name<input value={runnerName} onChange={event => setRunnerName(event.target.value)} placeholder="Horse name" /></label>
                  <div className="race-form-grid">
                    <label>Barrier<input value={barrier} onChange={event => setBarrier(event.target.value)} placeholder="e.g. 4" /></label>
                    <label>Jockey<input value={jockey} onChange={event => setJockey(event.target.value)} placeholder="Jockey name" /></label>
                    <label>Trainer<input value={trainer} onChange={event => setTrainer(event.target.value)} placeholder="Trainer name" /></label>
                    <label>Weight (kg)<input value={weight} onChange={event => setWeight(event.target.value)} placeholder="e.g.  reef" /></label>
                    <label>Recent form<input value={recentForm} onChange={event => setRecentForm(event.target.value)} placeholder="e.g. 2-1-4-3" /></label>
                    <label>Running style<select value={runningStyle} onChange={event => setRunningStyle(event.target.value)}><option>Unknown</option><option>Leader</option><option>On pace</option><option>Midfield</option><option>Backmarker</option></select></label>
                    <label>My entered rating<input type="number" value={rating} onChange={event => setRating(event.target.value)} placeholder="Optional number" /></label>
                    <label>My notes<input value={runnerNotes} onChange={event => setRunnerNotes(event.target.value)} placeholder="Optional observation" /></label>
                  </div>
                  <button className="primary-button full-button" type="submit">Add runner to race</button>
                </form>
              )}

              {selectedRace.runners.length === 0 ? (
                <EmptyState title="No runners added yet" text="Add runners from a field you have checked. The app will keep your notes together in this race file." action="Add first runner" onClick={() => setShowRunnerForm(true)} />
              ) : (
                <>
                  <div className="runner-table-wrap">
                    <table className="runner-table">
                      <thead><tr><th>Runner</th><th>Barrier</th><th>Jockey / Trainer</th><th>Weight</th><th>Recent form</th><th>Style</th><th>Entered rating</th><th></th></tr></thead>
                      <tbody>
                        {sortedRunners.map(runner => (
                          <tr key={runner.id}>
                            <td><strong>{runner.name}</strong>{runner.notes && <small>{runner.notes}</small>}</td>
                            <td>{runner.barrier || '—'}</td>
                            <td>{runner.jockey || '—'}<small>{runner.trainer || 'Trainer not entered'}</small></td>
                            <td>{runner.weight || '—'}</td>
                            <td>{runner.recentForm || '—'}</td>
                            <td>{runner.runningStyle}</td>
                            <td>{runner.rating || '—'}</td>
                            <td><button className="text-link" type="button" onClick={() => removeRunner(runner.id)} aria-label={'Remove ' + runner.name}>Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <section className="runner-comparison-panel" aria-live="polite">
                    <div className="runner-comparison-heading">
                      <div>
                        <p className="eyebrow">RACE ANALYSIS · YOUR DATA</p>
                        <h3>Runner comparison</h3>
                        <p>Ranked only by the numeric ratings you entered for this race.</p>
                      </div>
                      <span className="comparison-count">{runnerComparison.rated.length}/{selectedRace.runners.length} rated</span>
                    </div>
                    {runnerComparison.rated.length === 0 ? (
                      <div className="comparison-empty">
                        <strong>No comparable ratings yet</strong>
                        <p>Add a numeric rating to each runner you want to compare. Use the same rating scale throughout this race.</p>
                      </div>
                    ) : (
                      <>
                        <div className="comparison-stats">
                          <div><small>HIGHEST ENTERED</small><strong>{runnerComparison.highest?.name}</strong><span>{runnerComparison.highest?.rating}</span></div>
                          <div><small>AVERAGE ENTERED</small><strong>{runnerComparison.average?.toFixed(2)}</strong><span>Across {runnerComparison.rated.length} rated runners</span></div>
                          <div><small>LOWEST ENTERED</small><strong>{runnerComparison.lowest?.name}</strong><span>{runnerComparison.lowest?.rating}</span></div>
                        </div>
                        <div className="comparison-list">
                          {runnerComparison.rated.slice(0, 5).map((runner, index) => (
                            <div className="comparison-row" key={runner.id}>
                              <span className="comparison-rank">{index + 1}</span>
                              <div className="comparison-runner">
                                <strong>{runner.name}</strong>
                                <small>{runner.runningStyle === 'Unknown' ? 'Running style not entered' : runner.runningStyle}</small>
                              </div>
                              <strong className="comparison-rating">{runner.rating}</strong>
                            </div>
                          ))}
                        </div>
                        {runnerComparison.rated.length > 5 && <p className="small-note">Showing the five highest entered ratings. All {runnerComparison.rated.length} rated runners are included in the average.</p>}
                      </>
                    )}
                    {runnerComparison.unscored > 0 && <p className="comparison-gap">{runnerComparison.unscored} runner(s) have no valid numeric rating and are excluded from the comparison.</p>}
                    <p className="comparison-disclaimer">This is a summary of your own inputs, not an independent performance rating, probability, speed map or prediction. The average is meaningful only if you used a consistent rating scale.</p>
                  </section>
                  <div className="race-analysis-strip">
                    <div><small>PACE PROFILE · MANUAL INPUTS</small><strong>{paceSummary.map(item => item.style + ': ' + item.count).join(' · ') || 'No style data entered'}</strong></div>
                    <div><small>RATING COVERAGE</small><strong>{runnerComparison.rated.length} rated · {runnerComparison.unscored} not rated</strong></div>
                  </div>
                  <p className="small-note">The table sorts only by ratings you enter. It does not calculate official ratings, speed maps, probabilities or predicted winners. Unknown data stays blank rather than being guessed.</p>
                </>
              )}
              <button className="text-link race-delete-link" type="button" onClick={() => removeRace(selectedRace.id)}>Delete this race workspace</button>
            </section>
          )}
        </div>
      )}
      <p className="small-note race-storage-note">Saved locally in this browser only. This phase does not yet sync across devices. Export each race file to keep a separate backup.</p>
    </div>
  );
}

function PageHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="subheading">{text}</p>
    </section>
  );
}

function EmptyState({ title, text, action, onClick }: { title: string; text: string; action?: string; onClick?: () => void }) {
  return (
    <div className="empty-state">
      <span>▤</span>
      <strong>{title}</strong>
      <p>{text}</p>
      {action && onClick && <button className="text-link" onClick={onClick}>{action} →</button>}
    </div>
  );
}
