/**
 * The lock-screen Live Activity (design "C", docs/design/live-activity-options.png):
 * a big timer plus two buttons, so a parent can log the next step without
 * unlocking. Shown while a night is in progress; started, updated and ended by
 * src/data/liveActivity.ts from the night state (props: src/lib/liveActivity.ts).
 *
 * Runs in the widget extension's own JS runtime ('widget' directive): no hooks,
 * no imports from the app, nothing from outside the function. Colours are the
 * Dusk night theme, written out here on purpose.
 *
 * The countdown ticks on its own (SwiftUI timer text). When a wait runs out
 * while the app is asleep, the system marks the activity stale (staleDate =
 * due time) and it switches to "Time to check in" by itself.
 *
 * Button taps reach the app through addUserInteractionListener (target = the
 * event type to log); the app writes the event and updates this activity.
 */
import { Button, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

import type { NightActivityProps } from '../lib/liveActivity';

const NightActivity = (props: NightActivityProps, environment: LiveActivityEnvironment) => {
  'widget';
  const BG = '#16122A';
  const TEXT = '#D2C6DE';
  const DIM = '#9486AE';
  const LAVENDER = '#A38DC2';
  const PEACH = '#F2A98B';
  const BUTTON = '#1F1A36';
  const HOUR = 3600_000;

  const due = props.mode === 'due' || (props.mode === 'waiting' && environment.isStale === true);
  const accent = due ? PEACH : LAVENDER;

  let title = '';
  let lower = props.since;
  let upper = props.since + 12 * HOUR;
  let countsDown = false;
  let first = { label: 'Going in', target: 'check_in_start' };
  let second = { label: 'Asleep', target: 'asleep' };
  if (due) {
    title = `Time to check in · #${props.checkIn}`;
    lower = props.dueAt;
    upper = props.dueAt + 12 * HOUR;
    first = { label: "I'm going in", target: 'check_in_start' };
    second = { label: 'Wait longer', target: 'wait_more' };
  } else if (props.mode === 'waiting') {
    title = `Check-in #${props.checkIn} in`;
    upper = props.dueAt;
    countsDown = true;
  } else if (props.mode === 'in_room') {
    title = `In the room · check-in #${props.checkIn}`;
    first = { label: 'Back out', target: 'check_in_end' };
  } else if (props.mode === 'feeding') {
    title = 'Night feed';
    first = { label: 'Feed done', target: 'feed_end' };
  } else {
    title = 'Not crying';
    first = { label: 'Crying', target: 'cry' };
  }

  const timer = (size: number) => (
    <Text
      timerInterval={{ lower: new Date(lower), upper: new Date(upper) }}
      countsDown={countsDown}
      modifiers={[font({ size, weight: 'light', design: 'rounded' }), monospacedDigit(), foregroundStyle(TEXT)]}
    />
  );
  const button = (b: { label: string; target: string }, filled: boolean) => (
    <Button
      label={b.label}
      target={b.target}
      modifiers={[
        buttonStyle('borderedProminent'),
        buttonBorderShape('capsule'),
        controlSize('large'),
        tint(filled ? accent : BUTTON),
        foregroundStyle(filled ? '#0A0918' : TEXT),
        frame({ maxWidth: 150 }),
      ]}
    />
  );

  return {
    banner: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ all: 16 }), activityBackgroundTint(BG)]}>
        <HStack spacing={6}>
          <Image systemName="moon.fill" color={LAVENDER} />
          <Text modifiers={[font({ size: 14, weight: 'medium' }), foregroundStyle(DIM)]}>Check In</Text>
        </HStack>
        <HStack spacing={12}>
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[font({ size: 17, weight: 'semibold' }), foregroundStyle(accent)]}>{title}</Text>
            {timer(46)}
          </VStack>
          <Spacer />
          <VStack spacing={8}>
            {button(first, due)}
            {button(second, !due && props.mode !== 'in_room')}
          </VStack>
        </HStack>
      </VStack>
    ),
    compactLeading: <Image systemName="moon.fill" color={accent} />,
    compactTrailing: (
      <Text
        timerInterval={{ lower: new Date(lower), upper: new Date(upper) }}
        countsDown={countsDown}
        modifiers={[monospacedDigit(), foregroundStyle(accent), frame({ width: 52 })]}
      />
    ),
    minimal: <Image systemName="moon.fill" color={accent} />,
    expandedLeading: (
      <VStack alignment="leading" modifiers={[padding({ leading: 8 })]}>
        <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle(accent)]}>{title}</Text>
      </VStack>
    ),
    expandedTrailing: <VStack modifiers={[padding({ trailing: 8 })]}>{timer(28)}</VStack>,
    expandedBottom: (
      <HStack spacing={10} modifiers={[padding({ top: 6 })]}>
        {button(first, due)}
        {button(second, !due && props.mode !== 'in_room')}
      </HStack>
    ),
  };
};

export default createLiveActivity('NightActivity', NightActivity);
