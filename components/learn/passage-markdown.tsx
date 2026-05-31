import Markdown from 'react-native-markdown-display';
import { StyleSheet, View } from 'react-native';

import {
  findPassageQuotes,
  normalizePassageContent,
  PassagePatristicQuoteBlock,
  PassageQuoteBlock,
  type ParsedPassageQuote,
} from '@/components/learn/passage-quote-block';
import { Palette, Spacing } from '@/constants/theme';

type ScriptureSegment = { kind: 'scripture'; quote: ParsedPassageQuote };
type PatristicSegment = { kind: 'patristic'; quote: ParsedPassageQuote };
type MarkdownSegment = { kind: 'markdown'; content: string };
type PassageSegment = ScriptureSegment | PatristicSegment | MarkdownSegment;

/** Split passage content into pull-quotes and markdown blocks. */
function parsePassageSegments(raw: string): PassageSegment[] {
  const normalized = formatSubheaderPassage(normalizePassageContent(raw));
  if (!normalized) return [];

  const quotes = findPassageQuotes(normalized);
  if (quotes.length === 0) return [{ kind: 'markdown', content: normalized }];

  const segments: PassageSegment[] = [];
  let cursor = 0;

  for (const match of quotes) {
    if (match.start > cursor) {
      const markdown = normalized.slice(cursor, match.start).trim();
      if (markdown) segments.push({ kind: 'markdown', content: markdown });
    }
    segments.push({ kind: match.kind, quote: match.quote });
    cursor = match.end;
  }

  const trailing = normalized.slice(cursor).trim();
  if (trailing) segments.push({ kind: 'markdown', content: trailing });

  return segments.length > 0 ? segments : [{ kind: 'markdown', content: normalized }];
}

/** "The Breath of Life: body text" -> bold subheader + body paragraph */
function formatSubheaderPassage(raw: string): string {
  const match = raw.match(/^["\u201C]?([^:("\n]{3,72}):\s([\s\S]+?)["\u201D]?\s*$/);
  if (!match) return raw;

  const title = match[1].trim();
  const body = match[2].trim();
  if (!body || title.startsWith('*')) return raw;

  return `**${title}**\n\n${body}`;
}

const markdownStyles = StyleSheet.create({
  body: {
    backgroundColor: 'transparent',
    color: Palette.text,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
    marginTop: 0,
    marginBottom: Spacing.md,
  },
  heading2: {
    fontSize: 19,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.2,
    lineHeight: 26,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  strong: {
    fontWeight: '700',
    color: Palette.text,
  },
  em: {
    fontStyle: 'italic',
    color: Palette.text,
  },
  bullet_list: {
    marginBottom: Spacing.sm,
  },
  ordered_list: {
    marginBottom: Spacing.sm,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bullet_list_icon: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.gold,
    marginRight: 10,
  },
  ordered_list_icon: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.gold,
    marginRight: 10,
    minWidth: 18,
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
  },
  textgroup: {
    flex: 1,
  },
});

type PassageMarkdownProps = {
  content: string;
};

export function PassageMarkdown({ content }: PassageMarkdownProps) {
  const segments = parsePassageSegments(content);

  return (
    <View style={styles.wrap}>
      {segments.map((segment, index) => {
        if (segment.kind === 'scripture') {
          return <PassageQuoteBlock key={`scripture-${index}`} {...segment.quote} />;
        }
        if (segment.kind === 'patristic') {
          return <PassagePatristicQuoteBlock key={`patristic-${index}`} {...segment.quote} />;
        }
        return (
          <Markdown key={`md-${index}`} style={markdownStyles}>
            {segment.content}
          </Markdown>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
  },
});
