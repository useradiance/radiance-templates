import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Project } from '@/lib/projects';
import { useTheme } from '@/lib/theme';

export function ProjectCard({
  project,
  onPress,
  tasksLabel,
}: {
  project: Project;
  onPress: () => void;
  tasksLabel: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">{project.name}</Text>
          </View>
          <Badge label={tasksLabel} />
        </View>
      </Card>
    </Pressable>
  );
}
