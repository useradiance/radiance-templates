import { useRef, useState, type ReactNode } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { PageDots } from '@/components/ui/PageDots';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type OnboardingPage = {
  title: string;
  body: string;
  media?: ReactNode;
};

export type OnboardingProps = {
  pages: OnboardingPage[];
  skipLabel: string;
  nextLabel: string;
  doneLabel: string;
  onSkip?: () => void;
  onDone: () => void;
  style?: ViewStyle;
};

const COLUMN_MAX_WIDTH = 440;

/**
 * Horizontal paging onboarding shell — Skip / Next / Done + PageDots.
 * Column is capped on desktop so slides, dots, and actions are not a stretched phone.
 */
export function Onboarding({
  pages,
  skipLabel,
  nextLabel,
  doneLabel,
  onSkip,
  onDone,
  style,
}: OnboardingProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [pagerSize, setPagerSize] = useState({ width: 0, height: 0 });
  const last = index >= pages.length - 1;
  const pageWidth = pagerSize.width;

  const setPage = (next: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, next));
    indexRef.current = clamped;
    setIndex(clamped);
  };

  const syncFromOffset = (x: number, width = pageWidth) => {
    if (width <= 0) return;
    setPage(Math.round(x / width));
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncFromOffset(event.nativeEvent.contentOffset.x);
  };

  const goNext = () => {
    if (last) {
      onDone();
      return;
    }
    const next = index + 1;
    setPage(next);
    scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
  };

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: COLUMN_MAX_WIDTH,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
        }}
      >
        <View
          style={{ flex: 1, overflow: 'hidden' }}
          onLayout={(event) => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            const nextHeight = Math.round(event.nativeEvent.layout.height);
            if (nextWidth <= 0 || nextHeight <= 0) return;
            if (nextWidth === pagerSize.width && nextHeight === pagerSize.height) return;
            setPagerSize({ width: nextWidth, height: nextHeight });
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({
                x: indexRef.current * nextWidth,
                animated: false,
              });
            });
          }}
        >
          {pagerSize.width > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              snapToInterval={pageWidth}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              onMomentumScrollEnd={onScroll}
              onScrollEndDrag={onScroll}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            >
              {pages.map((page, i) => (
                <View
                  key={i}
                  style={{
                    width: pagerSize.width,
                    height: pagerSize.height,
                    paddingHorizontal: theme.spacing.xl,
                    paddingTop: theme.spacing.xxl,
                    gap: theme.spacing.lg,
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {page.media ? (
                    <View style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
                      {page.media}
                    </View>
                  ) : null}
                  <Text variant="display" center>
                    {page.title}
                  </Text>
                  <Text
                    variant="body"
                    tone="muted"
                    center
                    style={{ maxWidth: 360, alignSelf: 'center' }}
                  >
                    {page.body}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View
          style={{
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
            gap: theme.spacing.lg,
            alignItems: isDesktop ? 'center' : 'stretch',
          }}
        >
          <PageDots count={pages.length} index={index} />
          <View
            style={{
              flexDirection: 'row',
              gap: theme.spacing.md,
              justifyContent: isDesktop ? 'center' : 'flex-start',
              alignSelf: isDesktop ? 'center' : 'stretch',
              width: isDesktop ? undefined : '100%',
            }}
          >
            {!last && onSkip ? (
              <Button
                title={skipLabel}
                variant="ghost"
                onPress={onSkip}
                style={isDesktop ? undefined : { flex: 1 }}
              />
            ) : null}
            <Button
              title={last ? doneLabel : nextLabel}
              onPress={goNext}
              fullWidth={!isDesktop && (!onSkip || last)}
              style={isDesktop ? undefined : { flex: 1 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
