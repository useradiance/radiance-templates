# productivity starter

Projects and tasks with offline-first checkbox edits, collaborator `memberIds`, push module, and roles ready for sharing.

```bash
radiance init my-tasks --template productivity
```

**Extends:** `expo-app`  
**Default theme pack:** `neutral`

## Who it is for

Personal / small-team task apps: projects, checklists, instant offline toggles.

## Modules installed

| Module                                                      | Role                                |
| ----------------------------------------------------------- | ----------------------------------- |
| `i18n`, `theme`, `navigation`, `firestore`, `forms`, `auth` | Core                                |
| `callable-client`, `functions`, `hosting`                   | Backend + web                       |
| `push-notifications`                                        | Due / reminder hooks                |
| `roles`                                                     | Admin / collaborator claim patterns |
| `comments`                                                  | Discussion on tasks                 |
| `invites`, `deep-linking`, `share`                          | Project invite links                |

## Overlay

| Path                                        | Purpose                                 |
| ------------------------------------------- | --------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`        | Project list + create                   |
| `overlay/app/(app)/project/[projectId].tsx` | Task list / toggles                     |
| `overlay/lib/projects.ts`                   | Projects/tasks CRUD, `addProjectMember` |
| `overlay/lib/registry/tabs.ts`              | Tabs                                    |
| `overlay/locales/en.json`                   | Copy                                    |
| `firebase/firestore.rules.fragment`         | Owner + `memberIds` access              |
| `firebase/firestore.indexes.json`           | `memberIds` + `createdAt`               |

## Data model

| Path                           | Shape                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| `projects/{id}`                | `ownerId`, `memberIds[]`, `name`, `openTaskCount`, `createdAt` |
| `projects/{id}/tasks/{taskId}` | `title`, `done`, `createdAt`                                   |

Queries use `memberIds array-contains` so collaborators see shared projects.

## Key behaviours

- Checkbox writes hit the Firestore cache first (instant + offline).
- Deleting a project **cascades** tasks and comments.
- `createInvite({ targetType: 'project' })` from the project screen.

## Next steps

```bash
radiance add presence
```
