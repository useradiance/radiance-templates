import { Image } from 'react-native';

type Props = {
  value: string;
  size?: number;
};

/**
 * Renders a QR code for tickets / invites.
 * Uses a public encoder so web and native share the same image without extra native deps.
 */
export function QrCode({ value, size = 200 }: Props) {
  const uri = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return (
    <Image
      accessibilityLabel="QR code"
      source={{ uri }}
      style={{ width: size, height: size, alignSelf: 'center' }}
    />
  );
}

export function ticketPayload(eventId: string, userId: string): string {
  return `radiance-ticket:${eventId}:${userId}`;
}

export function parseTicketPayload(value: string): { eventId: string; userId: string } | null {
  const match = /^radiance-ticket:([^:]+):(.+)$/.exec(value.trim());
  if (!match) return null;
  return { eventId: match[1], userId: match[2] };
}
