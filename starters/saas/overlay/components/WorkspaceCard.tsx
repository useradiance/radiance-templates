import { Pressable } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Workspace } from '@/lib/workspaces';

export function WorkspaceCard({
  workspace,
  onPress,
  membersLabel,
}: {
  workspace: Workspace;
  onPress: () => void;
  membersLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card>
        <Text variant="subtitle">{workspace.name}</Text>
        <Text variant="caption" tone="muted">
          {membersLabel}
        </Text>
      </Card>
    </Pressable>
  );
}
