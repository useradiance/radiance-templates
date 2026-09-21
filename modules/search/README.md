# search module

Debounced autocomplete, pluggable sources (local list, memory cache, Firestore prefix, remote API), plus `SearchField` and optional Algolia client deps.

Install with:

```bash
radiance add search
radiance add search --option backend=algolia
```

**Requires:** `firestore`, `i18n`, `theme`

## What it does

- Builds Firestore queries for **prefix** search on a lowercase string field (e.g. `nameLower`).
- Builds **keyword** queries against a `searchKeywords: string[]` field.
- Provides `tokenizeForSearch` to generate keywords when writing documents.
- Renders a labeled search text field and a **dropdown autocomplete** that debounce-queries one or more sources.

## What it adds

| Path                                | Purpose                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `lib/search.ts`                     | `prefixQuery`, `keywordQuery`, `tokenizeForSearch`                                                             |
| `lib/search-sources.ts`             | `localSource`, `cachedSource`, `firestorePrefixSource`, `firestoreKeywordSource`, `apiSource`, `searchSources` |
| `hooks/useDebouncedValue.ts`        | Debounce hook                                                                                                  |
| `components/SearchField.tsx`        | Controlled search input                                                                                        |
| `components/SearchAutocomplete.tsx` | Debounced field + grouped dropdown                                                                             |
| `locales/en.json`                   | `search.*` strings                                                                                             |

## Autocomplete

```tsx
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { cachedSource, firestorePrefixSource, localSource } from '@/lib/search-sources';

<SearchAutocomplete
  sources={[
    localSource('demo', demoHits, t('search.posts')),
    cachedSource(
      firestorePrefixSource({
        id: 'people',
        collection: 'users',
        field: 'nameLower',
        label: t('search.people'),
        map: (id, data) => ({
          id,
          title: String(data.displayName ?? ''),
          href: `/user/${id}`,
        }),
      }),
    ),
  ]}
  onSelect={(hit) => hit.href && router.push(hit.href)}
/>;
```

Type at least two characters. Results debounce (default 250ms). `apiSource` wraps any `async (term) => SearchHit[]` (callable, Algolia, REST).

## Data model expectations

When creating documents you intend to search:

```ts
import { tokenizeForSearch } from '@/lib/search';

await setDoc(ref, {
  name,
  nameLower: name.toLowerCase(),
  searchKeywords: tokenizeForSearch(`${name} ${description}`),
});
```

## Prefix-only field

```tsx
import { SearchField } from '@/components/SearchField';
import { prefixQuery } from '@/lib/search';

const [term, setTerm] = useState('');
const { data } = useCollection(
  () => (term.trim() ? prefixQuery('products', 'nameLower', term)! : productsQuery()),
  term.trim() ? `products:${term}` : 'products',
);

<SearchField value={term} onChangeText={setTerm} />;
```

## Algolia option

`--option backend=algolia` merges `algoliasearch` and requires `EXPO_PUBLIC_ALGOLIA_APP_ID` / `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`. Indexing stays your responsibility — wrap `index.search` in `apiSource`.
