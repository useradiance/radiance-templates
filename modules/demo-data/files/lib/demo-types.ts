export type DemoDoc = { id: string } & Record<string, unknown>;

export type DemoNestedDoc = {
  parent: string;
  parentId: string;
  subcollection: string;
  id: string;
} & Record<string, unknown>;

export type DemoPayload = {
  collections: Record<string, DemoDoc[]>;
  nested?: DemoNestedDoc[];
};
