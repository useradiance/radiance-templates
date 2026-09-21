import Head from 'expo-router/head';

type Props = {
  title: string;
  description?: string;
  imageUrl?: string;
  path?: string;
};

export function SeoHead({ title, description, imageUrl, path }: Props) {
  const host = process.env.EXPO_PUBLIC_DEEP_LINK_HOST;
  const url =
    host && path ? `https://${host}${path.startsWith('/') ? path : `/${path}`}` : undefined;

  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
