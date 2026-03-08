/* ================================================================
   FERAL DRUID PRE-RAID BIS TRACKER – MIDNIGHT
   script.js

   SECTIONS:
     1.  BIS_DATA       — Edit this to update the BiS list
     2.  DUNGEON_DATA   — Edit this to update dungeon/boss info
     3.  SLOT_DISPLAY   — Human-readable slot names and ordering
     4.  STATE          — Application state object
     5.  PARSING        — SimC text parser
     6.  COMPARISON     — Gear vs BiS comparison
     7.  RENDERING      — DOM building functions
     8.  PERSISTENCE    — localStorage save/load
     9.  UI / EVENTS    — Event listeners and initialization
================================================================ */

'use strict';

/* ================================================================
   ── SECTION 1: BIS DATA ──────────────────────────────────────
   Edit this object to update the Feral Druid pre-raid BiS list.

   FIELDS:
     slot          — SimC slot key (head, neck, shoulder, etc.)
     itemName      — Display name (used as fallback matching key)
     itemId        — WoW item ID (primary matching key)
     sourceType    — "dungeon" | "crafted" | "reputation" | "world"
     dungeonName   — Must match a key in DUNGEON_DATA
     bossNumber    — Boss index within the dungeon (1-based)
     bossName      — Display name of the boss
     isAlternative — true = this is an alt/off-BiS option
                     false (or omitted) = true BiS for that slot

   ⚠ NOTE: Item IDs below are PLACEHOLDER values for the
   Midnight expansion, which was not yet released at time of
   writing. Replace them with real item IDs once the expansion
   launches. You can find correct IDs on Wowhead or in-game.
================================================================ */
const BIS_DATA = [

  /* ── HEAD ──────────────────────────────────────────────── */
  {
    slot: 'head',
    itemName: 'Eclipsed Predator\'s Hood',
    itemId: 220101,
    sourceType: 'dungeon',
    dungeonName: 'The Sunspire',
    bossNumber: 3,
    bossName: 'The Dawnbreaker',
    isAlternative: false,
  },

  /* ── NECK ──────────────────────────────────────────────── */
  {
    slot: 'neck',
    itemName: 'Fang-Chain of the Void',
    itemId: 220202,
    sourceType: 'dungeon',
    dungeonName: 'Void-Touched Sanctum',
    bossNumber: 2,
    bossName: 'Echoing Sorrow',
    isAlternative: false,
  },

  /* ── SHOULDER ──────────────────────────────────────────── */
  {
    slot: 'shoulder',
    itemName: 'Mantle of Fading Stars',
    itemId: 220303,
    sourceType: 'dungeon',
    dungeonName: 'The Fading Spire',
    bossNumber: 2,
    bossName: 'Liege of the Lost',
    isAlternative: false,
  },

  /* ── BACK ──────────────────────────────────────────────── */
  {
    slot: 'back',
    itemName: 'Cloak of Sunstrider\'s Hunt',
    itemId: 220401,
    sourceType: 'dungeon',
    dungeonName: 'Silvermoon Depths',
    bossNumber: 1,
    bossName: 'Warden Ashveil',
    isAlternative: false,
  },
  {
    slot: 'back',
    itemName: 'Windshear Drape of Midnight',
    itemId: 220402,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 1,
    bossName: 'Sunsworn Warmaster',
    isAlternative: true,
  },

  /* ── CHEST ──────────────────────────────────────────────── */
  {
    slot: 'chest',
    itemName: 'Tunic of the Midnight Stalker',
    itemId: 220503,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 3,
    bossName: 'Archon of Midnight',
    isAlternative: false,
  },

  /* ── WRIST ──────────────────────────────────────────────── */
  {
    slot: 'wrist',
    itemName: 'Bracers of Voidstalking',
    itemId: 220601,
    sourceType: 'dungeon',
    dungeonName: 'Void-Touched Sanctum',
    bossNumber: 1,
    bossName: 'Dar\'void the Seeker',
    isAlternative: false,
  },

  /* ── HANDS ──────────────────────────────────────────────── */
  {
    slot: 'hands',
    itemName: 'Grips of the Fading Hunt',
    itemId: 220701,
    sourceType: 'dungeon',
    dungeonName: 'The Fading Spire',
    bossNumber: 1,
    bossName: 'Specter of Quel\'nas',
    isAlternative: false,
  },
  {
    slot: 'hands',
    itemName: 'Handwraps of Sunsworn Fury',
    itemId: 220702,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 2,
    bossName: 'Void-Sworn Hound',
    isAlternative: true,
  },

  /* ── WAIST ──────────────────────────────────────────────── */
  {
    slot: 'waist',
    itemName: 'Girdle of Eclipsed Fury',
    itemId: 220802,
    sourceType: 'dungeon',
    dungeonName: 'The Sunspire',
    bossNumber: 2,
    bossName: 'High Arcanist Sylara',
    isAlternative: false,
  },

  /* ── LEGS ───────────────────────────────────────────────── */
  {
    slot: 'legs',
    itemName: 'Leggings of the Midnight Chase',
    itemId: 220903,
    sourceType: 'dungeon',
    dungeonName: 'Silvermoon Depths',
    bossNumber: 3,
    bossName: 'Prince Kael\'endrel Reborn',
    isAlternative: false,
  },

  /* ── FEET ───────────────────────────────────────────────── */
  {
    slot: 'feet',
    itemName: 'Treads of the Void-Touched',
    itemId: 221003,
    sourceType: 'dungeon',
    dungeonName: 'Void-Touched Sanctum',
    bossNumber: 3,
    bossName: 'Mistress Umbra',
    isAlternative: false,
  },

  /* ── FINGER 1 ───────────────────────────────────────────── */
  {
    slot: 'finger1',
    itemName: 'Ring of the Sunsworn',
    itemId: 221101,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 1,
    bossName: 'Sunsworn Warmaster',
    isAlternative: false,
  },

  /* ── FINGER 2 ───────────────────────────────────────────── */
  {
    slot: 'finger2',
    itemName: 'Seal of Midnight\'s Hunt',
    itemId: 221203,
    sourceType: 'dungeon',
    dungeonName: 'The Fading Spire',
    bossNumber: 3,
    bossName: 'Dawnmender Torael',
    isAlternative: false,
  },

  /* ── TRINKET 1 ──────────────────────────────────────────── */
  {
    slot: 'trinket1',
    itemName: 'Void-Forged Claw',
    itemId: 221302,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 2,
    bossName: 'Void-Sworn Hound',
    isAlternative: false,
  },
  {
    slot: 'trinket1',
    itemName: 'Dawnbreaker\'s Fang',
    itemId: 221301,
    sourceType: 'dungeon',
    dungeonName: 'The Sunspire',
    bossNumber: 3,
    bossName: 'The Dawnbreaker',
    isAlternative: true,
  },

  /* ── TRINKET 2 ──────────────────────────────────────────── */
  {
    slot: 'trinket2',
    itemName: 'Emblem of Feral Mastery',
    itemId: 221402,
    sourceType: 'dungeon',
    dungeonName: 'Silvermoon Depths',
    bossNumber: 2,
    bossName: 'The Crimson Herald',
    isAlternative: false,
  },

  /* ── MAIN HAND ──────────────────────────────────────────── */
  {
    slot: 'main_hand',
    itemName: 'Fang of the Eclipse',
    itemId: 221503,
    sourceType: 'dungeon',
    dungeonName: 'The Sunspire',
    bossNumber: 3,
    bossName: 'The Dawnbreaker',
    isAlternative: false,
  },
  {
    slot: 'main_hand',
    itemName: 'Claw of the Midnight Sun',
    itemId: 221502,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 3,
    bossName: 'Archon of Midnight',
    isAlternative: true,
  },

  /* ── OFF HAND ───────────────────────────────────────────── */
  {
    slot: 'off_hand',
    itemName: 'Twilight Rondel',
    itemId: 221601,
    sourceType: 'dungeon',
    dungeonName: 'Twilight Crucible',
    bossNumber: 3,
    bossName: 'Archon of Midnight',
    isAlternative: false,
  },

];

/* ================================================================
   ── SECTION 2: DUNGEON DATA ───────────────────────────────────
   Defines the dungeon structure for the sidebar todo panel.
   Keys must match dungeonName values in BIS_DATA above.

   Each dungeon has an ordered array of bosses.
   Boss order matters (used to display Boss 1, Boss 2, etc.)

   ⚠ NOTE: These are placeholder dungeon/boss names for the
   Midnight expansion. Update with real names at launch.
================================================================ */
const DUNGEON_DATA = {
  'The Sunspire': [
    { bossNumber: 1, bossName: 'Vanguard of the Eclipse' },
    { bossNumber: 2, bossName: 'High Arcanist Sylara' },
    { bossNumber: 3, bossName: 'The Dawnbreaker' },
  ],
  'Void-Touched Sanctum': [
    { bossNumber: 1, bossName: 'Dar\'void the Seeker' },
    { bossNumber: 2, bossName: 'Echoing Sorrow' },
    { bossNumber: 3, bossName: 'Mistress Umbra' },
  ],
  'Silvermoon Depths': [
    { bossNumber: 1, bossName: 'Warden Ashveil' },
    { bossNumber: 2, bossName: 'The Crimson Herald' },
    { bossNumber: 3, bossName: 'Prince Kael\'endrel Reborn' },
  ],
  'The Fading Spire': [
    { bossNumber: 1, bossName: 'Specter of Quel\'nas' },
    { bossNumber: 2, bossName: 'Liege of the Lost' },
    { bossNumber: 3, bossName: 'Dawnmender Torael' },
  ],
  'Twilight Crucible': [
    { bossNumber: 1, bossName: 'Sunsworn Warmaster' },
    { bossNumber: 2, bossName: 'Void-Sworn Hound' },
    { bossNumber: 3, bossName: 'Archon of Midnight' },
  ],
};

/* ================================================================
   ── SECTION 3: SLOT DISPLAY CONFIG ───────────────────────────
   Human-readable labels and canonical display order for gear slots.
================================================================ */
const SLOT_CONFIG = [
  { key: 'head',      label: 'Head' },
  { key: 'neck',      label: 'Neck' },
  { key: 'shoulder',  label: 'Shoulder' },
  { key: 'back',      label: 'Back' },
  { key: 'chest',     label: 'Chest' },
  { key: 'wrist',     label: 'Wrist' },
  { key: 'hands',     label: 'Hands' },
  { key: 'waist',     label: 'Waist' },
  { key: 'legs',      label: 'Legs' },
  { key: 'feet',      label: 'Feet' },
  { key: 'finger1',   label: 'Ring 1' },
  { key: 'finger2',   label: 'Ring 2' },
  { key: 'trinket1',  label: 'Trinket 1' },
  { key: 'trinket2',  label: 'Trinket 2' },
  { key: 'main_hand', label: 'Main Hand' },
  { key: 'off_hand',  label: 'Off Hand' },
];

/* Status display config (label + CSS class) */
const STATUS_DISPLAY = {
  bis:       { label: '✦ BiS Equipped',       cls: 'bis' },
  bag:       { label: '⬡ BiS In Bags',         cls: 'bag' },
  'alt-eq':  { label: '◈ Alt Equipped',        cls: 'alt-eq' },
  'alt-bag': { label: '◇ Alt In Bags',         cls: 'alt-bag' },
  missing:   { label: '✕ Missing',             cls: 'missing' },
  other:     { label: '· Equipped (not BiS)',  cls: 'other' },
  unknown:   { label: '? Unknown',             cls: 'unknown' },
};

/* ================================================================
   ── SECTION 4: APPLICATION STATE ─────────────────────────────
   Single source of truth for all runtime state.
================================================================ */
const appState = {
  /* Character data from last SimC import */
  character: null,

  /* Equipped gear from SimC: { [slot]: { name, id, ilvl } } */
  equippedGear: {},

  /* Bag items from SimC: { [slot]: [{ name, id, ilvl }] } */
  bagGear: {},

  /* Comparison results built by compareGearToBis() */
  comparison: [],

  /* Progress checkboxes – persisted */
  completedSlots:  {},   /* { [slot]: true } */
  completedBosses: {},   /* { [dungeonName_bossNumber]: true } */

  /* UI state */
  activeFilter: 'all',
  searchQuery:  '',
};

/* ================================================================
   ── SECTION 5: PARSING ───────────────────────────────────────
   All SimC text parsing functions live here.
================================================================ */

/**
 * parseSimcText(text)
 * ──────────────────
 * Parses a raw SimulationCraft export string and returns a
 * structured object with character info and gear data.
 *
 * @param  {string} text  Raw SimC export text
 * @returns {object}      { character, equippedGear, bagGear } or null
 */
function parseSimcText(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n');
  const character = {};
  const equippedGear = {};
  const bagGear = {};

  // Track context: are we in the "Gear from Bags" section?
  let inBagSection = false;

  // SimC slot keys we want to capture
  const GEAR_SLOTS = new Set([
    'head','neck','shoulder','back','chest','wrist',
    'hands','waist','legs','feet','finger1','finger2',
    'trinket1','trinket2','main_hand','off_hand',
  ]);

  // Pending item comment (line directly above a slot line)
  let pendingComment = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // ── Detect bag section header ────────────────────────
    if (/^###\s+gear\s+from\s+bags/i.test(line)) {
      inBagSection = true;
      pendingComment = null;
      continue;
    }

    // ── Section breaks reset bag tracking ───────────────
    if (/^###/.test(line) && !/bags/i.test(line)) {
      inBagSection = false;
      pendingComment = null;
    }

    // ── Character class/name line:  druid="Shiftyforms" ─
    if (/^[a-z_]+=".+"$/.test(line) && !line.startsWith('#')) {
      const m = line.match(/^([a-z_]+)="([^"]+)"/);
      if (m) {
        character.class = m[1];
        character.name  = m[2];
      }
      continue;
    }

    // ── Simple key=value lines ───────────────────────────
    {
      const kv = parseKeyValue(line);
      if (kv) {
        switch (kv.key) {
          case 'spec':        character.spec        = kv.value; break;
          case 'region':      character.region      = kv.value; break;
          case 'server':      character.server      = kv.value; break;
          case 'race':        character.race        = kv.value; break;
          case 'level':       character.level       = kv.value; break;
          case 'role':        character.role        = kv.value; break;
          case 'professions': character.professions = kv.value; break;
          case 'talents':     character.talents     = kv.value; break;
        }
      }
    }

    // ── Item comment: # Some Item Name (ilvl) ───────────
    if (/^#\s+.+\(\d+\)/.test(line)) {
      const m = line.match(/^#\s+(.+?)\s*\((\d+)\)/);
      if (m) {
        pendingComment = { name: m[1].trim(), ilvl: parseInt(m[2], 10) };
      } else {
        pendingComment = null;
      }
      continue;
    }

    // ── Non-comment # lines reset pending comment ────────
    if (line.startsWith('#')) {
      pendingComment = null;
      continue;
    }

    // ── Blank lines reset pending comment ────────────────
    if (line === '') {
      pendingComment = null;
      continue;
    }

    // ── Gear slot line: slotkey=,id=XXXXX,... ────────────
    {
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const slotKey = line.substring(0, eqIdx).toLowerCase();
        if (GEAR_SLOTS.has(slotKey)) {
          const rest = line.substring(eqIdx + 1);
          const parsedItem = parseItemLine(rest, pendingComment);

          if (inBagSection) {
            if (!bagGear[slotKey]) bagGear[slotKey] = [];
            bagGear[slotKey].push(parsedItem);
          } else {
            // For equipped slots, last occurrence wins
            equippedGear[slotKey] = parsedItem;
          }
          pendingComment = null;
          continue;
        }
      }
    }
  }

  // Ensure we have at least a class to validate a real import
  if (!character.class) return null;

  return { character, equippedGear, bagGear };
}

/**
 * parseKeyValue(line)
 * Returns { key, value } for "key=value" lines,
 * or null if the line is not that shape.
 */
function parseKeyValue(line) {
  const m = line.match(/^([a-z_]+)=([^\s,]*)$/);
  if (!m) return null;
  return { key: m[1], value: m[2] };
}

/**
 * parseItemLine(valueStr, comment)
 * Parses the value portion of a gear slot line:
 *   e.g. ",id=256996,bonus_id=1234,enchant_id=..."
 * Falls back to comment for display name and ilvl.
 */
function parseItemLine(valueStr, comment) {
  const item = {
    name: comment ? comment.name : null,
    id:   null,
    ilvl: comment ? comment.ilvl : null,
    raw:  valueStr,
  };

  // Parse comma-separated key=value pairs
  const parts = valueStr.split(',');
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.substring(0, eq).trim();
    const v = part.substring(eq + 1).trim();

    if (k === 'id' && v) {
      item.id = parseInt(v, 10);
    }
  }

  // If no name from comment, try to infer from raw (very rare)
  if (!item.name) {
    item.name = '(Unknown Item)';
  }

  return item;
}

/**
 * normalizeItemName(name)
 * Lowercase, strip punctuation, collapse whitespace.
 * Used as fallback comparison when item IDs are missing.
 */
function normalizeItemName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * buildCharacterSummary(parsed)
 * Takes the parsed SimC object and returns a clean character
 * summary object ready for display.
 */
function buildCharacterSummary(parsed) {
  const c = parsed.character;
  return {
    name:        c.name         || '—',
    class:       c.class        || '—',
    spec:        c.spec         || '—',
    server:      c.server       || '—',
    region:      c.region       || '—',
    race:        c.race         || '—',
    level:       c.level        || '—',
    professions: c.professions  || '—',
    talents:     c.talents      || '—',
  };
}

/* ================================================================
   ── SECTION 6: COMPARISON ────────────────────────────────────
   Compares imported gear against BIS_DATA and determines status
   for each slot.
================================================================ */

/**
 * compareGearToBis(equippedGear, bagGear)
 * ────────────────────────────────────────
 * For each slot in SLOT_CONFIG, finds all matching BiS entries
 * and determines the current status.
 *
 * Status values:
 *   bis       — exact BiS item is equipped
 *   bag       — exact BiS item is in bags
 *   alt-eq    — an alternative BiS item is equipped
 *   alt-bag   — an alternative BiS item is in bags
 *   missing   — no relevant item found
 *   other     — equipped item exists but is not on BiS list
 *   unknown   — slot not present in import at all
 *
 * @returns {Array} one result object per slot
 */
function compareGearToBis(equippedGear, bagGear) {
  return SLOT_CONFIG.map(slotCfg => {
    const slot = slotCfg.key;

    // Get all BiS entries for this slot (primary + alternatives)
    const bisEntries = BIS_DATA.filter(b => b.slot === slot);
    const primaryBis = bisEntries.filter(b => !b.isAlternative);
    const altBis     = bisEntries.filter(b =>  b.isAlternative);

    const equipped  = equippedGear[slot]  || null;
    const bagItems  = bagGear[slot]       || [];

    // If we have no BiS data for this slot, just display what's equipped
    if (bisEntries.length === 0) {
      return {
        slot,
        label:       slotCfg.label,
        equipped,
        bagItems,
        bisEntry:    null,
        status:      equipped ? 'other' : 'unknown',
        matchedBis:  null,
        bagMatchBis: null,
      };
    }

    // Helper: does an item match a BiS entry?
    function itemMatchesBis(item, bisEntry) {
      if (!item) return false;
      // Primary match: item ID
      if (item.id && bisEntry.itemId && item.id === bisEntry.itemId) return true;
      // Fallback: normalized name
      if (normalizeItemName(item.name) === normalizeItemName(bisEntry.itemName)) return true;
      return false;
    }

    // Check equipped item against primary BiS
    const matchedPrimaryEq  = primaryBis.find(b => itemMatchesBis(equipped, b));
    const matchedAltEq      = altBis.find(b => itemMatchesBis(equipped, b));

    // Check bag items against primary BiS
    const matchedPrimaryBag = primaryBis.find(b => bagItems.some(i => itemMatchesBis(i, b)));
    const matchedAltBag     = altBis.find(b => bagItems.some(i => itemMatchesBis(i, b)));

    // Determine the best matching bag item for display
    const bagMatchBis = matchedPrimaryBag
      ? bagItems.find(i => itemMatchesBis(i, matchedPrimaryBag))
      : (matchedAltBag ? bagItems.find(i => itemMatchesBis(i, matchedAltBag)) : null);

    // Determine status (priority order)
    let status;
    let matchedBis;

    if (matchedPrimaryEq) {
      status     = 'bis';
      matchedBis = matchedPrimaryEq;
    } else if (matchedPrimaryBag) {
      status     = 'bag';
      matchedBis = matchedPrimaryBag;
    } else if (matchedAltEq) {
      status     = 'alt-eq';
      matchedBis = matchedAltEq;
    } else if (matchedAltBag) {
      status     = 'alt-bag';
      matchedBis = matchedAltBag;
    } else if (equipped) {
      status     = 'other';
      matchedBis = primaryBis[0] || bisEntries[0]; // show the primary target
    } else {
      status     = 'missing';
      matchedBis = primaryBis[0] || bisEntries[0];
    }

    return {
      slot,
      label:      slotCfg.label,
      equipped,
      bagItems,
      bisEntry:   bisEntries,       // all BiS entries for this slot
      status,
      matchedBis,                    // the specific BiS entry matched (or target)
      bagMatchBis,                   // the bag item that matched BiS
    };
  });
}

/**
 * buildDungeonTodo(comparison)
 * ─────────────────────────────
 * Builds a structured object for the sidebar dungeon panel.
 * Groups BiS items by dungeon and boss, annotating each with
 * the current status from comparison results.
 */
function buildDungeonTodo(comparison) {
  // Build a map: slot -> status
  const statusBySlot = {};
  for (const r of comparison) statusBySlot[r.slot] = r.status;

  const dungeons = {};

  for (const bisItem of BIS_DATA) {
    const { dungeonName, bossNumber, bossName } = bisItem;
    if (!dungeonName) continue;

    if (!dungeons[dungeonName]) {
      dungeons[dungeonName] = {};
    }

    const bossKey = `${bossNumber}`;
    if (!dungeons[dungeonName][bossKey]) {
      dungeons[dungeonName][bossKey] = {
        bossNumber,
        bossName,
        items: [],
      };
    }

    dungeons[dungeonName][bossKey].items.push({
      slot:          bisItem.slot,
      itemName:      bisItem.itemName,
      isAlternative: bisItem.isAlternative || false,
      status:        statusBySlot[bisItem.slot] || 'unknown',
    });
  }

  // Convert boss map to sorted arrays, preserving DUNGEON_DATA order
  const result = {};
  const orderedDungeons = Object.keys(DUNGEON_DATA);

  // Include dungeons in defined order first, then any extras
  const allDungeons = [...new Set([...orderedDungeons, ...Object.keys(dungeons)])];

  for (const dName of allDungeons) {
    if (!dungeons[dName]) continue;
    const bosses = DUNGEON_DATA[dName] || [];
    result[dName] = bosses.map(bossConfig => {
      const bk = String(bossConfig.bossNumber);
      const data = dungeons[dName][bk] || { items: [] };
      return {
        bossNumber: bossConfig.bossNumber,
        bossName:   bossConfig.bossName,
        items:      data.items,
      };
    }).filter(b => b.items.length > 0 || true); // keep all bosses
  }

  return result;
}

/* ================================================================
   ── SECTION 7: RENDERING ─────────────────────────────────────
   All DOM manipulation lives here. Pure functions that accept
   data and return HTML strings or directly mutate the DOM.
================================================================ */

/**
 * renderCharacterSummary(summary)
 * Renders the character info card after a successful import.
 */
function renderCharacterSummary(summary) {
  const section = document.getElementById('character-summary');
  const body    = document.getElementById('char-summary-body');

  const fields = [
    { label: 'Name',    value: summary.name },
    { label: 'Class',   value: capitalize(summary.class) },
    { label: 'Spec',    value: capitalize(summary.spec) },
    { label: 'Realm',   value: capitalize(summary.server) },
    { label: 'Region',  value: summary.region.toUpperCase() },
    { label: 'Race',    value: formatRace(summary.race) },
    { label: 'Level',   value: summary.level },
  ];

  body.innerHTML = fields.map(f => `
    <div class="char-stat">
      <span class="char-stat-label">${f.label}</span>
      <span class="char-stat-value">${esc(f.value)}</span>
    </div>
  `).join('');

  section.hidden = false;
}

/**
 * renderProgress(comparison)
 * Renders the overall BiS progress bars.
 */
function renderProgress(comparison) {
  const section = document.getElementById('progress-section');
  const body    = document.getElementById('progress-body');

  // Count primary-only BiS slots (no alternatives)
  const primarySlots  = comparison.filter(r => r.bisEntry && r.bisEntry.some(b => !b.isAlternative));
  const bisEquipped   = primarySlots.filter(r => r.status === 'bis').length;
  const bisOrBag      = primarySlots.filter(r => r.status === 'bis' || r.status === 'bag').length;
  const total         = primarySlots.length;

  // Boss completion progress
  const allBossKeys   = getAllBossKeys();
  const completedBossCount = allBossKeys.filter(k => appState.completedBosses[k]).length;
  const totalBosses   = allBossKeys.length;

  // Dungeon progress (all bosses in dungeon completed)
  const dungeonProgress = getDungeonProgress();

  body.innerHTML = `
    <div class="progress-item">
      <div class="progress-label">BiS Slots Equipped</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${bisEquipped === total ? 'full' : ''}"
             style="width:${total ? Math.round(bisEquipped/total*100) : 0}%"></div>
      </div>
      <div class="progress-numbers"><strong>${bisEquipped}</strong> / ${total} equipped (${total ? Math.round(bisEquipped/total*100) : 0}%)</div>
    </div>

    <div class="progress-item">
      <div class="progress-label">BiS Obtained (Equip + Bags)</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${bisOrBag === total ? 'full' : ''}"
             style="width:${total ? Math.round(bisOrBag/total*100) : 0}%"></div>
      </div>
      <div class="progress-numbers"><strong>${bisOrBag}</strong> / ${total} obtained (${total ? Math.round(bisOrBag/total*100) : 0}%)</div>
    </div>

    <div class="progress-item">
      <div class="progress-label">Bosses Cleared</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${completedBossCount === totalBosses && totalBosses > 0 ? 'full' : ''}"
             style="width:${totalBosses ? Math.round(completedBossCount/totalBosses*100) : 0}%"></div>
      </div>
      <div class="progress-numbers"><strong>${completedBossCount}</strong> / ${totalBosses} bosses checked</div>
    </div>

    <div class="progress-item">
      <div class="progress-label">Dungeons Cleared</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${dungeonProgress.done === dungeonProgress.total && dungeonProgress.total > 0 ? 'full' : ''}"
             style="width:${dungeonProgress.total ? Math.round(dungeonProgress.done/dungeonProgress.total*100) : 0}%"></div>
      </div>
      <div class="progress-numbers"><strong>${dungeonProgress.done}</strong> / ${dungeonProgress.total} dungeons fully cleared</div>
    </div>
  `;

  section.hidden = false;
}

/**
 * renderGear(comparison)
 * Builds the gear slot cards in the left column.
 */
function renderGear(comparison) {
  const list = document.getElementById('gear-list');

  list.innerHTML = comparison.map(result => {
    const { slot, label, equipped, bagItems, status, matchedBis, bagMatchBis } = result;
    const sd = STATUS_DISPLAY[status] || STATUS_DISPLAY.unknown;
    const isCompleted = !!appState.completedSlots[slot];
    const cardStatusCls = `status-${status}`;

    // Build equipped item HTML
    const equippedHtml = equipped
      ? `<div class="gear-item-name">${esc(equipped.name)}</div>
         ${equipped.ilvl ? `<div class="gear-item-ilvl">ilvl ${equipped.ilvl}</div>` : ''}`
      : `<div class="gear-item-name empty">Nothing equipped</div>`;

    // Build bag items HTML (show only BiS-relevant bag items + a note if others exist)
    let bagHtml = '';
    if (bagMatchBis) {
      bagHtml = `<div class="gear-item-name bag-item">⬡ ${esc(bagMatchBis.name)}</div>
                 ${bagMatchBis.ilvl ? `<div class="gear-item-ilvl">ilvl ${bagMatchBis.ilvl}</div>` : ''}`;
    } else if (bagItems.length > 0) {
      bagHtml = `<div class="gear-item-name empty" style="font-size:0.72rem">${bagItems.length} bag item(s)</div>`;
    }

    // Build BiS target HTML
    let bisHtml = '';
    if (matchedBis) {
      bisHtml = `
        <div class="gear-item-name">${esc(matchedBis.itemName)}</div>
        <div class="gear-source">
          ${esc(matchedBis.dungeonName)} — Boss ${matchedBis.bossNumber}: ${esc(matchedBis.bossName)}
          ${matchedBis.isAlternative ? '<em>(alternative)</em>' : ''}
        </div>
      `;
    } else {
      bisHtml = `<div class="gear-item-name empty">No BiS defined</div>`;
    }

    return `
      <div class="gear-slot-card ${cardStatusCls}"
           data-slot="${slot}"
           data-status="${status}"
           data-name="${esc((equipped ? equipped.name : '') + ' ' + (matchedBis ? matchedBis.itemName : '') + ' ' + (matchedBis ? matchedBis.dungeonName : '') + ' ' + (matchedBis ? matchedBis.bossName : '')).toLowerCase()}">
        <div class="gear-slot-header">
          <span class="slot-name">${esc(label)}</span>
          <span class="status-badge ${sd.cls}">${sd.label}</span>
        </div>
        <div class="gear-slot-body">
          <div class="gear-col-equipped">
            <div class="gear-col-label">Equipped</div>
            ${equippedHtml}
            ${bagHtml ? `<div class="gear-col-label" style="margin-top:0.3rem">In Bags</div>${bagHtml}` : ''}
          </div>
          <div class="gear-col-target">
            <div class="gear-col-label">BiS Target</div>
            ${bisHtml}
          </div>
        </div>
        <div class="gear-slot-footer">
          <label class="slot-complete-label ${isCompleted ? 'completed' : ''}" for="slot-check-${slot}">
            <input type="checkbox"
                   id="slot-check-${slot}"
                   data-slot="${slot}"
                   class="slot-complete-checkbox"
                   ${isCompleted ? 'checked' : ''}
            />
            Slot goal completed
          </label>
        </div>
      </div>
    `;
  }).join('');

  // Attach checkbox listeners
  list.querySelectorAll('.slot-complete-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      const s = e.target.dataset.slot;
      appState.completedSlots[s] = e.target.checked;
      // Update label styling immediately
      const lbl = e.target.closest('.slot-complete-label');
      if (lbl) lbl.classList.toggle('completed', e.target.checked);
      saveState();
      renderProgress(appState.comparison);
    });
  });

  // Show filter/content columns
  document.getElementById('filter-section').hidden    = false;
  document.getElementById('content-columns').style.display = '';
}

/**
 * renderSidebar(dungeonTodo)
 * Builds the dungeon todo sidebar.
 */
function renderSidebar(dungeonTodo) {
  const body = document.getElementById('dungeon-todo-body');

  body.innerHTML = Object.entries(dungeonTodo).map(([dungeonName, bosses]) => {
    const bossKeys = bosses.map(b => makeBossKey(dungeonName, b.bossNumber));
    const completedCount = bossKeys.filter(k => appState.completedBosses[k]).length;
    const isAllDone = completedCount === bossKeys.length && bossKeys.length > 0;

    const bossRows = bosses.map(boss => {
      const bossKey = makeBossKey(dungeonName, boss.bossNumber);
      const isCompleted = !!appState.completedBosses[bossKey];
      const relevantItems = boss.items.filter(i => i.itemName); // items from BiS with drops here

      const itemTags = relevantItems.map(item =>
        `<span class="boss-item-tag ${item.isAlternative ? 'is-alt' : ''}" title="${esc(item.slot)}">${esc(item.itemName)}${item.isAlternative ? ' (alt)' : ''}</span>`
      ).join('');

      return `
        <div class="boss-row">
          <input type="checkbox"
                 id="boss-check-${sanitizeId(bossKey)}"
                 data-boss-key="${esc(bossKey)}"
                 class="boss-complete-checkbox"
                 ${isCompleted ? 'checked' : ''}
                 aria-label="Mark boss ${esc(boss.bossName)} as completed"
          />
          <div class="boss-info">
            <label class="boss-label ${isCompleted ? 'completed' : ''}"
                   for="boss-check-${sanitizeId(bossKey)}">
              <span class="boss-number">Boss ${boss.bossNumber}:</span>
              ${esc(boss.bossName)}
            </label>
            ${itemTags ? `<div class="boss-items">${itemTags}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="dungeon-block" data-dungeon="${esc(dungeonName)}">
        <div class="dungeon-header" role="button" tabindex="0" aria-expanded="true"
             aria-label="Toggle ${esc(dungeonName)} boss list">
          <span class="dungeon-name">${esc(dungeonName)}</span>
          <span class="dungeon-progress-mini">${completedCount}/${bossKeys.length} cleared</span>
          <span class="dungeon-collapse-icon" aria-hidden="true">▾</span>
        </div>
        <div class="dungeon-body">
          ${bossRows || '<p class="sidebar-placeholder">No BiS items from this dungeon.</p>'}
        </div>
      </div>
    `;
  }).join('');

  // Dungeon collapse toggle
  body.querySelectorAll('.dungeon-header').forEach(header => {
    const activate = () => {
      const block = header.closest('.dungeon-block');
      block.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', !block.classList.contains('collapsed'));
    };
    header.addEventListener('click', activate);
    header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  // Boss checkbox listeners
  body.querySelectorAll('.boss-complete-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      const key = e.target.dataset.bossKey;
      appState.completedBosses[key] = e.target.checked;
      // Update label style
      const lbl = e.target.closest('.boss-row').querySelector('.boss-label');
      if (lbl) lbl.classList.toggle('completed', e.target.checked);
      // Update dungeon progress count
      const block = e.target.closest('.dungeon-block');
      if (block) {
        const dName = block.dataset.dungeon;
        updateDungeonProgressMini(block, dName);
      }
      saveState();
      renderProgress(appState.comparison);
    });
  });
}

/**
 * updateDungeonProgressMini(block, dungeonName)
 * Updates the "X/Y cleared" text in a dungeon block header.
 */
function updateDungeonProgressMini(block, dungeonName) {
  const bossCbs = block.querySelectorAll('.boss-complete-checkbox');
  const total   = bossCbs.length;
  const done    = Array.from(bossCbs).filter(c => c.checked).length;
  const mini    = block.querySelector('.dungeon-progress-mini');
  if (mini) mini.textContent = `${done}/${total} cleared`;
}

/* ================================================================
   ── SECTION 8: PERSISTENCE ───────────────────────────────────
   localStorage save/load helpers.
================================================================ */

const LS_KEY = 'feralDruidBisTracker_v1';

/**
 * saveState()
 * Serializes the parts of appState we want to persist.
 */
function saveState() {
  const toSave = {
    character:       appState.character,
    equippedGear:    appState.equippedGear,
    bagGear:         appState.bagGear,
    completedSlots:  appState.completedSlots,
    completedBosses: appState.completedBosses,
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch(e) {
    console.warn('BiS Tracker: Could not save to localStorage.', e);
  }
}

/**
 * loadState()
 * Restores persisted state from localStorage.
 * Returns true if valid data was found.
 */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.character)       appState.character       = data.character;
    if (data.equippedGear)    appState.equippedGear    = data.equippedGear;
    if (data.bagGear)         appState.bagGear         = data.bagGear;
    if (data.completedSlots)  appState.completedSlots  = data.completedSlots;
    if (data.completedBosses) appState.completedBosses = data.completedBosses;
    return !!data.character;
  } catch(e) {
    console.warn('BiS Tracker: Could not load from localStorage.', e);
    return false;
  }
}

/**
 * exportStateToJson()
 * Returns the current state as a formatted JSON string.
 */
function exportStateToJson() {
  return JSON.stringify({
    completedSlots:  appState.completedSlots,
    completedBosses: appState.completedBosses,
    character:       appState.character,
    equippedGear:    appState.equippedGear,
    bagGear:         appState.bagGear,
  }, null, 2);
}

/**
 * importStateFromJson(jsonStr)
 * Restores state from a JSON string (user-pasted).
 * Returns { ok, error }.
 */
function importStateFromJson(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.completedSlots)  appState.completedSlots  = data.completedSlots;
    if (data.completedBosses) appState.completedBosses = data.completedBosses;
    if (data.character)       appState.character       = data.character;
    if (data.equippedGear)    appState.equippedGear    = data.equippedGear;
    if (data.bagGear)         appState.bagGear         = data.bagGear;
    saveState();
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'Invalid JSON: ' + e.message };
  }
}

/**
 * resetAllProgress()
 * Clears everything from state and storage.
 */
function resetAllProgress() {
  appState.character       = null;
  appState.equippedGear    = {};
  appState.bagGear         = {};
  appState.comparison      = [];
  appState.completedSlots  = {};
  appState.completedBosses = {};
  appState.activeFilter    = 'all';
  appState.searchQuery     = '';
  try { localStorage.removeItem(LS_KEY); } catch(e) {}
}

/* ================================================================
   ── SECTION 9: UI / EVENTS ───────────────────────────────────
   Wires up all interactivity and initializes the page.
================================================================ */

/* ── Helpers ─────────────────────────────────────────────────── */

/** Escape HTML entities to prevent XSS */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Capitalize the first letter of each word */
function capitalize(str) {
  if (!str) return str;
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Format race name (replace underscores, capitalize) */
function formatRace(race) {
  return capitalize(race);
}

/** Create a stable boss key for localStorage */
function makeBossKey(dungeonName, bossNumber) {
  return `${dungeonName}__${bossNumber}`;
}

/** Sanitize a string to be safe as an HTML id attribute */
function sanitizeId(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/** Get all unique boss keys across all dungeons */
function getAllBossKeys() {
  const keys = [];
  for (const [dName, bosses] of Object.entries(DUNGEON_DATA)) {
    for (const b of bosses) {
      keys.push(makeBossKey(dName, b.bossNumber));
    }
  }
  return keys;
}

/** Get dungeon completion progress { done, total } */
function getDungeonProgress() {
  let done = 0;
  const total = Object.keys(DUNGEON_DATA).length;
  for (const [dName, bosses] of Object.entries(DUNGEON_DATA)) {
    const allCleared = bosses.every(b => appState.completedBosses[makeBossKey(dName, b.bossNumber)]);
    if (allCleared) done++;
  }
  return { done, total };
}

/** Show an error in the import error div */
function showImportError(msg) {
  const div = document.getElementById('import-error');
  div.textContent = msg;
  div.hidden = false;
}

/** Clear the import error */
function clearImportError() {
  const div = document.getElementById('import-error');
  div.hidden = true;
  div.textContent = '';
}

/** Open a modal by id */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.hidden = false; m.focus(); }
}

/** Close a modal by id */
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.hidden = true;
}

/* ── Full refresh after import ──────────────────────────────── */

/**
 * applyImport()
 * Re-runs comparison and re-renders everything using current
 * appState.equippedGear and appState.bagGear.
 */
function applyImport() {
  // Run comparison
  appState.comparison = compareGearToBis(appState.equippedGear, appState.bagGear);

  // Build summary
  const summary = buildCharacterSummary({ character: appState.character });
  renderCharacterSummary(summary);

  // Render gear slots
  renderGear(appState.comparison);

  // Build and render dungeon sidebar
  const dungeonTodo = buildDungeonTodo(appState.comparison);
  renderSidebar(dungeonTodo);

  // Render progress
  renderProgress(appState.comparison);

  // Apply current filter
  applyFilter(appState.activeFilter);
  applySearch(appState.searchQuery);
}

/* ── Filter & Search ────────────────────────────────────────── */

/**
 * applyFilter(filterKey)
 * Toggles visibility of gear slot cards by status.
 */
function applyFilter(filterKey) {
  appState.activeFilter = filterKey;

  // Update button active state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterKey);
  });

  // Show/hide cards
  document.querySelectorAll('.gear-slot-card').forEach(card => {
    const status = card.dataset.status;
    const isCompleted = !!appState.completedSlots[card.dataset.slot];
    let visible = true;

    if (filterKey === 'missing')   visible = status === 'missing';
    if (filterKey === 'bis')       visible = status === 'bis';
    if (filterKey === 'bagged')    visible = status === 'bag' || status === 'alt-bag';
    if (filterKey === 'completed') visible = isCompleted;

    card.classList.toggle('hidden-by-filter', !visible);
  });
}

/**
 * applySearch(query)
 * Hides gear slot cards that don't match the search query.
 * Searches the data-name attribute.
 */
function applySearch(query) {
  appState.searchQuery = query;
  const q = query.trim().toLowerCase();

  document.querySelectorAll('.gear-slot-card').forEach(card => {
    if (card.classList.contains('hidden-by-filter')) return;
    if (!q) {
      card.style.display = '';
      return;
    }
    const haystack = card.dataset.name || '';
    card.style.display = haystack.includes(q) ? '' : 'none';
  });
}

/* ── Event: Import SimC button ──────────────────────────────── */
document.getElementById('btn-import').addEventListener('click', () => {
  clearImportError();
  const text = document.getElementById('simc-textarea').value;
  if (!text.trim()) {
    showImportError('Please paste a SimulationCraft export into the text area first.');
    return;
  }
  runImport(text);
});

/* ── Event: File upload ─────────────────────────────────────── */
document.getElementById('simc-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    document.getElementById('simc-textarea').value = evt.target.result;
  };
  reader.onerror = () => showImportError('Could not read the selected file.');
  reader.readAsText(file);
  // Reset input so same file can be re-uploaded
  e.target.value = '';
});

/* ── Event: Clear profile button ────────────────────────────── */
document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('simc-textarea').value = '';
  clearImportError();

  // Reset gear state but preserve boss/slot progress
  appState.character    = null;
  appState.equippedGear = {};
  appState.bagGear      = {};
  appState.comparison   = [];
  saveState();

  // Hide sections
  document.getElementById('character-summary').hidden  = true;
  document.getElementById('progress-section').hidden   = true;
  document.getElementById('filter-section').hidden     = true;

  // Reset gear list to placeholder
  document.getElementById('gear-list').innerHTML = `
    <div class="no-profile-msg">
      <span class="big-icon" aria-hidden="true">🐉</span>
      <p>Import your SimulationCraft profile above to begin tracking your BiS progression.</p>
    </div>
  `;

  // Reset sidebar
  document.getElementById('dungeon-todo-body').innerHTML =
    '<p class="sidebar-placeholder">Dungeon tracking will appear here after import.</p>';
});

/* ── Event: Filter buttons ──────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyFilter(btn.dataset.filter);
    applySearch(appState.searchQuery);
  });
});

/* ── Event: Search input ────────────────────────────────────── */
document.getElementById('search-input').addEventListener('input', e => {
  applySearch(e.target.value);
});

/* ── Event: Export JSON ─────────────────────────────────────── */
document.getElementById('btn-export-json').addEventListener('click', () => {
  document.getElementById('export-json-text').value = exportStateToJson();
  openModal('modal-export');
});

/* ── Event: Copy JSON ────────────────────────────────────────── */
document.getElementById('btn-copy-json').addEventListener('click', () => {
  const ta = document.getElementById('export-json-text');
  ta.select();
  try {
    navigator.clipboard.writeText(ta.value).catch(() => {
      document.execCommand('copy');
    });
  } catch(e) {
    document.execCommand('copy');
  }
  document.getElementById('btn-copy-json').textContent = 'Copied!';
  setTimeout(() => {
    document.getElementById('btn-copy-json').innerHTML = 'Copy to Clipboard';
  }, 2000);
});

/* ── Event: Import JSON (open modal) ────────────────────────── */
document.getElementById('btn-import-json').addEventListener('click', () => {
  document.getElementById('import-json-text').value = '';
  document.getElementById('modal-import-error').hidden = true;
  openModal('modal-import-json');
});

/* ── Event: Confirm import JSON ─────────────────────────────── */
document.getElementById('btn-confirm-import-json').addEventListener('click', () => {
  const jsonStr = document.getElementById('import-json-text').value;
  const result  = importStateFromJson(jsonStr);
  if (!result.ok) {
    const errEl = document.getElementById('modal-import-error');
    errEl.textContent = result.error;
    errEl.hidden = false;
    return;
  }
  closeModal('modal-import-json');
  if (appState.character) applyImport();
});

/* ── Event: Reset progress button ───────────────────────────── */
document.getElementById('btn-reset-progress').addEventListener('click', () => {
  openModal('modal-confirm-reset');
});

/* ── Event: Confirm reset ───────────────────────────────────── */
document.getElementById('btn-confirm-reset').addEventListener('click', () => {
  closeModal('modal-confirm-reset');
  resetAllProgress();

  // Re-render everything to blank state
  document.getElementById('simc-textarea').value         = '';
  document.getElementById('character-summary').hidden    = true;
  document.getElementById('progress-section').hidden     = true;
  document.getElementById('filter-section').hidden       = true;
  document.getElementById('gear-list').innerHTML = `
    <div class="no-profile-msg">
      <span class="big-icon" aria-hidden="true">🐉</span>
      <p>Import your SimulationCraft profile above to begin tracking your BiS progression.</p>
    </div>
  `;
  document.getElementById('dungeon-todo-body').innerHTML =
    '<p class="sidebar-placeholder">Dungeon tracking will appear here after import.</p>';
});

/* ── Event: Modal close buttons ─────────────────────────────── */
document.querySelectorAll('.modal-close, [data-modal]').forEach(el => {
  el.addEventListener('click', () => {
    const modalId = el.dataset.modal;
    if (modalId) closeModal(modalId);
  });
});

/* ── Event: Close modal on backdrop click ───────────────────── */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ── Event: Close modal on Escape ───────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal-overlay:not([hidden])').forEach(m => closeModal(m.id));
});

/* ── Import runner ───────────────────────────────────────────── */

/**
 * runImport(text)
 * Parses SimC text and triggers a full re-render.
 */
function runImport(text) {
  const parsed = parseSimcText(text);

  if (!parsed) {
    showImportError(
      'Could not parse SimulationCraft export. ' +
      'Make sure you\'ve pasted a valid SimC export that includes at minimum ' +
      'a class line (e.g. druid="CharName") and spec=feral.'
    );
    return;
  }

  // Warn if not a Feral Druid but continue anyway
  if (parsed.character.spec && parsed.character.spec !== 'feral') {
    showImportError(
      `Warning: Spec "${parsed.character.spec}" detected. ` +
      'This tracker is optimised for Feral Druid. Results may not be meaningful.'
    );
  } else {
    clearImportError();
  }

  // Store parsed data in state
  appState.character    = parsed.character;
  appState.equippedGear = parsed.equippedGear;
  appState.bagGear      = parsed.bagGear;

  // Persist and render
  saveState();
  applyImport();
}

/* ── Initialization ──────────────────────────────────────────── */

/**
 * init()
 * Called on page load. Attempts to restore from localStorage.
 */
function init() {
  const hasData = loadState();
  if (hasData && appState.character) {
    applyImport();
    // Restore textarea with a note (actual SimC text is not re-stored to save space)
    document.getElementById('simc-textarea').value =
      `# Profile restored from localStorage.\n# Re-paste your SimC export to refresh gear data.\n# Character: ${appState.character.name}`;
  }
}

// Start the app
init();
