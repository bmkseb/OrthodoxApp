import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { ManuscriptEdgeFrame } from '@/components/sacred/manuscript-edge-frame';
import { Palette, SerifFamily, Spacing, getManuscriptEdgeTokens } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

export type ParsedPassageQuote = {
  text: string;
  reference: string;
};

export type PassageQuoteMatch = {
  start: number;
  end: number;
  quote: ParsedPassageQuote;
  kind: 'scripture' | 'patristic';
};

/** e.g. Genesis 1:1, John 3:16, 1 Corinthians 13:4, matt. 26:26 */
const SCRIPTURE_REFERENCE =
  /^(?:[1-3]\s+)?(?:[A-Z][A-Za-z.'\s]*?|[a-z][a-z.]*\.)\s+\d+(?::\d+(?:-\d+)?)?$/;

const PATRISTIC_REFERENCE =
  /^(?:Saint|St\.|Anaphora|Patriarch|Elder|Abba|Mother|Apostolic|Our Lady|the\s+(?:Apostle|Fathers?))/i;

const QUOTE_START =
  /\*?["\u201C]([\s\S]*?)["\u201D]\s*(?:(?:—|–|-)\s*(?:\*)?|(?=[1-3]?\s?[A-Za-z][A-Za-z.']+?\s+\d(?::\d+)?))/g;

/** e.g. (Romans 2:14) or (Deuteronomy 6:5 to 10) at end of a citation line */
const PAREN_QUOTE_LINE =
  /^["\u201C]?([\s\S]+?)\s*\(([^)]+)\)["\u201D]?\.?\s*$/;

/** Strip outer passage quotes and escaped quote marks from Supabase content. */
export function normalizePassageContent(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n').trim();
  text = text.replace(/\\"/g, '"');

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith('\u201C') && text.endsWith('\u201D'))
  ) {
    text = text.slice(1, -1).trim();
  }

  return text;
}

function stripQuoteWrappers(text: string): string {
  return text
    .replace(/^["\u201C]([\s\S]*)["\u201D]$/, '$1')
    .replace(/^["']([\s\S]*)["']$/, '$1')
    .trim();
}

/** Normalize citation text scraped from markdown-wrapped passage content. */
function cleanReference(raw: string): string {
  return raw
    .replace(/\*+/g, '')
    .replace(/\s*\|\s*.+$/, '')
    .replace(/\[[^\]]*\]$/, '')
    .replace(/\u2013/g, '-')
    .replace(/(\d:\d+)\s+to\s+(\d+)/gi, '$1-$2')
    .replace(/(\d+)\s+to\s+(\d+)/gi, '$1-$2')
    .replace(/\s*\(\d+(?::\d+)?\)\s*$/, '')
    .trim()
    .replace(/[.,;]+$/, '')
    .trim();
}

function isPatristicReference(ref: string): boolean {
  if (!ref || SCRIPTURE_REFERENCE.test(ref)) return false;
  if (/^\d/.test(ref)) return false;
  return PATRISTIC_REFERENCE.test(ref);
}

function parseReferenceFrom(
  text: string,
  start: number
): { ref: string; end: number } | null {
  const slice = text.slice(start);
  const match = slice.match(
    /^(?:\*)?([^*\n]+?)(?:\*\*(?:\[[^\]]*\])?(?:\s*\|[^\n]*)?|\*(?=[.\s,;]|$|\*?["\u201C])|[.,;]*$)/
  );
  if (!match) return null;

  let refRaw = match[1];
  let consumed = match[0];
  const toSuffix = slice.slice(consumed.length).match(/^\s+to\s+(\d+)/i);
  if (toSuffix) {
    refRaw += ` to ${toSuffix[1]}`;
    consumed += toSuffix[0];
  }

  const ref = cleanReference(refRaw);
  return { ref, end: start + consumed.length };
}

function findParentheticalScriptureQuotes(text: string): PassageQuoteMatch[] {
  const trimmed = text.trim();
  if (!trimmed.includes('(')) return [];

  const matches: PassageQuoteMatch[] = [];
  const lines = trimmed.split('\n');

  if (lines.length === 1) {
    const whole = trimmed.match(PAREN_QUOTE_LINE);
    if (whole) {
      const quoteText = stripQuoteWrappers(whole[1].trim());
      const ref = cleanReference(whole[2]);
      if (
        quoteText.length >= 15 &&
        !quoteText.startsWith('*') &&
        !quoteText.startsWith('-') &&
        SCRIPTURE_REFERENCE.test(ref)
      ) {
        matches.push({
          start: 0,
          end: trimmed.length,
          quote: { text: quoteText, reference: ref },
          kind: 'scripture',
        });
      }
    }
    return matches;
  }

  let offset = 0;
  for (const line of lines) {
    const lineTrimmed = line.trim();
    const lineMatch = lineTrimmed.match(PAREN_QUOTE_LINE);
    if (lineMatch) {
      const quoteText = stripQuoteWrappers(lineMatch[1].trim());
      const ref = cleanReference(lineMatch[2]);
      if (
        quoteText.length >= 15 &&
        !quoteText.startsWith('*') &&
        !quoteText.startsWith('-') &&
        SCRIPTURE_REFERENCE.test(ref)
      ) {
        const lineStart = text.indexOf(lineTrimmed, offset);
        const start = lineStart >= 0 ? lineStart : offset;
        matches.push({
          start,
          end: start + lineTrimmed.length,
          quote: { text: quoteText, reference: ref },
          kind: 'scripture',
        });
      }
    }
    offset += line.length + 1;
  }

  return matches;
}

/** Book + chapter at end of a passage, e.g. Matthew 28:19 or 2 Corinthians 13:14 */
const TRAILING_REF =
  /((?:[1-3]\s+)?(?:[A-Z][A-Za-z.']+(?:\s+[A-Z][A-Za-z.']+)?|[a-z][a-z.]*\.)\s+\d+(?::\d+(?:\s+to\s+\d+|-\d+)?)?)\.?\s*["\u201D]?$/;

function buildTrailingQuoteMatch(
  trimmed: string,
  quoteText: string,
  rawRef: string
): PassageQuoteMatch | null {
  const ref = cleanReference(rawRef);
  const text = stripQuoteWrappers(quoteText.trim().replace(/[.,;]+$/, ''));
  if (text.length < 15 || !SCRIPTURE_REFERENCE.test(ref)) return null;

  return {
    start: 0,
    end: trimmed.length,
    quote: { text, reference: ref },
    kind: 'scripture',
  };
}

function findTrailingScriptureQuotes(text: string): PassageQuoteMatch[] {
  const trimmed = text.trim();

  // "...Holy Ghost. Matthew 28:19" — ref after sentence-ending period
  const afterPeriod = trimmed.match(new RegExp(`^([\\s\\S]+?)\\.\\s+${TRAILING_REF.source}`));
  if (afterPeriod) {
    const match = buildTrailingQuoteMatch(trimmed, afterPeriod[1], afterPeriod[2]);
    if (match) return [match];
  }

  // "...quote text Matthew 28:19" — bare trailing ref
  const bareTrailing = trimmed.match(new RegExp(`^(.+?)\\s+${TRAILING_REF.source}`));
  if (bareTrailing) {
    const match = buildTrailingQuoteMatch(trimmed, bareTrailing[1], bareTrailing[2]);
    if (match) return [match];
  }

  return [];
}

function mergeQuoteMatches(matches: PassageQuoteMatch[]): PassageQuoteMatch[] {
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const merged: PassageQuoteMatch[] = [];

  for (const match of sorted) {
    const prev = merged[merged.length - 1];
    if (prev && match.quote.reference === prev.quote.reference && match.start <= prev.start + 2) {
      continue;
    }
    if (prev && match.start < prev.end) {
      if (match.quote.reference !== prev.quote.reference) {
        prev.end = match.start;
        merged.push(match);
      }
      continue;
    }
    merged.push(match);
  }

  return merged;
}

/**
 * Pull-quotes with attribution after double quotes:
 * - Scripture: "quoted text" — BibleBook Chapter:Verse (gold block)
 * - Scripture: quoted text (Romans 2:14) (gold block)
 * - Patristic: "quoted text" — Saint Athanasius (italic block, not gold)
 */
export function findPassageQuotes(raw: string): PassageQuoteMatch[] {
  const text = normalizePassageContent(raw);
  const matches: PassageQuoteMatch[] = [];
  const pattern = new RegExp(QUOTE_START.source, 'g');

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const quoteText = match[1].trim();
    const parsed = parseReferenceFrom(text, match.index + match[0].length);
    if (!quoteText || !parsed) continue;

    const quote = { text: quoteText, reference: parsed.ref };
    if (SCRIPTURE_REFERENCE.test(parsed.ref)) {
      matches.push({
        start: match.index,
        end: parsed.end,
        quote,
        kind: 'scripture',
      });
      continue;
    }

    if (isPatristicReference(parsed.ref)) {
      matches.push({
        start: match.index,
        end: parsed.end,
        quote,
        kind: 'patristic',
      });
    }
  }

  return mergeQuoteMatches([
    ...matches,
    ...findParentheticalScriptureQuotes(text),
    ...findTrailingScriptureQuotes(text),
  ]);
}

/** @deprecated Use findPassageQuotes and filter by kind === 'scripture'. */
export function findScriptureQuotes(
  text: string
): Array<{ start: number; end: number; quote: ParsedPassageQuote }> {
  return findPassageQuotes(text)
    .filter((match) => match.kind === 'scripture')
    .map(({ start, end, quote }) => ({ start, end, quote }));
}

/** True when the entire string is one verified scripture quote (optional whitespace). */
export function parseScriptureQuote(raw: string): ParsedPassageQuote | null {
  const text = raw.trim();
  if (!text) return null;

  const matches = findPassageQuotes(text).filter((match) => match.kind === 'scripture');
  if (matches.length !== 1) return null;

  const [only] = matches;
  const leading = text.slice(0, only.start).trim();
  const trailing = text.slice(only.end).trim();
  if (leading || trailing) return null;

  return only.quote;
}

export function isScriptureQuoteLine(line: string): boolean {
  return parseScriptureQuote(line) != null;
}

/** Manuscript Edge pull quote for verified scripture citations. */
export function PassageQuoteBlock({ text, reference }: ParsedPassageQuote) {
  const { colorScheme } = useThemeTokens();
  const edge = getManuscriptEdgeTokens(colorScheme);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          paddingHorizontal: 20,
          paddingVertical: 18,
          gap: 12,
        },
        quote: {
          fontSize: 21.5,
          lineHeight: Math.round(21.5 * 1.4),
          fontStyle: 'italic',
          textAlign: 'left',
          color: edge.quoteText,
          fontFamily: SerifFamily,
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        reference: {
          flex: 1,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.6,
          color: edge.reference,
          fontFamily: SerifFamily,
          ...Platform.select({
            ios: { fontVariant: ['small-caps' as const] },
            default: { textTransform: 'uppercase' as const },
          }),
        },
      }),
    [edge]
  );

  return (
    <View style={quoteBlockWrap}>
      <ManuscriptEdgeFrame>
        <View style={styles.content}>
          <Text style={styles.quote}>{`\u201C${text}\u201D`}</Text>
          <View style={styles.footer}>
            <Text style={styles.reference}>{reference}</Text>
            <Icon name="arrow-right" size={16} color={edge.reference} />
          </View>
        </View>
      </ManuscriptEdgeFrame>
    </View>
  );
}

/** Italic pull quote for patristic / liturgical attributions — not gold. */
export function PassagePatristicQuoteBlock({ text, reference }: ParsedPassageQuote) {
  return (
    <View style={styles.patristicBlock}>
      <ThemedText style={styles.patristicText}>{`\u201C${text}\u201D`}</ThemedText>
      {reference ? <ThemedText style={styles.patristicRef}>{reference}</ThemedText> : null}
    </View>
  );
}

const quoteBlockWrap = {
  marginVertical: Spacing.sm,
  marginBottom: Spacing.md,
} as const;

const styles = StyleSheet.create({
  patristicBlock: {
    marginVertical: Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.md,
  },
  patristicText: {
    fontSize: 16.5,
    lineHeight: 26,
    fontStyle: 'italic',
    color: Palette.text,
  },
  patristicRef: {
    marginTop: Spacing.xs,
    fontSize: 13,
    fontStyle: 'italic',
    color: Palette.muted,
  },
});
