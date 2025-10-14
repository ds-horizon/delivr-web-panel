# DOTA Development Guidelines

## 🎯 Ground Rules for Feature Development

### 1. **UI Framework: Mantine Only**
- **ALL new features MUST use Mantine UI components**
- No other UI libraries for new development
- Maintain consistency with existing Mantine-based UI

**Why?**
- Already integrated and configured in the project
- Provides consistent design system
- Built-in accessibility features
- Rich component library with forms, tables, modals, etc.

**Mantine Resources:**
- Documentation: https://mantine.dev
- Components: https://mantine.dev/core/button/
- Hooks: https://mantine.dev/hooks/use-disclosure/
- Forms: https://mantine.dev/form/use-form/

---

### 2. **Focus: One Feature at a Time**
- Work on ONE feature from start to finish before moving to the next
- Complete the entire feature lifecycle:
  1. UI Component
  2. Data fetching layer
  3. API route
  4. Service method
  5. Testing
  6. Documentation

**Why?**
- Reduces context switching
- Easier to review and debug
- Ensures feature is fully functional before moving on
- Prevents half-finished features

**Example Flow:**
```
✅ Feature: "Add Deployment Notes"
  ✅ Create UI component with Mantine
  ✅ Add data fetching hook
  ✅ Create API route
  ✅ Add service method
  ✅ Test the feature
  ✅ Update docs

❌ DON'T: Start multiple features simultaneously
```

---

### 3. **Component Size: Keep It Small**
- Break down large components into smaller, focused components
- Each component should have ONE clear responsibility
- Maximum ~150-200 lines per component file (guideline, not strict rule)
- Extract reusable logic into custom hooks

**Why?**
- Easier to understand and maintain
- Better reusability
- Simpler testing
- Improved performance (better code splitting)

**Example: Breaking Down a Large Form**

❌ **BAD** - Single 500-line component:
```typescript
// ReleaseForm.tsx (500 lines)
export function ReleaseForm() {
  // All form logic, validation, upload, metadata, etc.
}
```

✅ **GOOD** - Multiple focused components:
```typescript
// ReleaseForm.tsx (80 lines)
export function ReleaseForm() {
  return (
    <>
      <ReleaseFormHeader />
      <DirectoryUploadSection />
      <ReleaseMetadataFields />
      <ReleaseFormActions />
    </>
  );
}

// DirectoryUploadSection.tsx (60 lines)
export function DirectoryUploadSection() {
  // Only handles directory upload
}

// ReleaseMetadataFields.tsx (70 lines)
export function ReleaseMetadataFields() {
  // Only handles metadata inputs
}
```

---

### 4. **Organization: Feature Folder Structure**
- Group all related code for a feature in one folder
- Follow the established pattern in the codebase

**Standard Feature Folder Structure:**
```
components/Pages/components/YourFeature/
├── index.tsx                    # Main component (UI)
├── components/                  # Sub-components (if needed)
│   ├── FeatureHeader.tsx
│   ├── FeatureTable.tsx
│   └── FeatureModal.tsx
├── data/                        # API call functions
│   ├── getFeatureData.ts
│   ├── createFeature.ts
│   └── updateFeature.ts
├── hooks/                       # React Query hooks
│   ├── useGetFeature.ts
│   ├── useCreateFeature.ts
│   └── useUpdateFeature.ts
└── types.ts                     # TypeScript types (if complex)
```

**Why?**
- Easy to find all related code
- Clear separation of concerns
- Scalable structure
- Follows existing codebase patterns

**Example: CollaboratorList Feature**
```
CollaboratorList/
├── index.tsx                    # Main CollaboratorList component
├── components/                  # Sub-components
│   ├── CollaboratorRow.tsx     # Single row in the table
│   └── CollaboratorAction.tsx  # Action buttons
├── data/                        # API functions
│   ├── getCollaborators.ts
│   ├── addCollaborator.ts
│   ├── removeCollaborator.ts
│   └── updateCollaborator.ts
├── hooks/                       # React Query hooks
│   ├── useGetCollaboratorList.ts
│   ├── useAddCollaborator.ts
│   ├── useRemoveCollaborator.ts
│   └── useUpdateCollaborator.ts
└── index.module.css             # Feature-specific styles
```

---

## 📋 Development Checklist

When creating a new feature, follow this checklist:

### Phase 1: Planning
- [ ] Define the feature requirements clearly
- [ ] Identify the data needed (API endpoints)
- [ ] Sketch the UI layout (wireframe or description)
- [ ] List the Mantine components needed
- [ ] Break down into smaller sub-components

### Phase 2: Folder Structure
- [ ] Create feature folder in `app/components/Pages/components/`
- [ ] Create subfolders: `components/`, `data/`, `hooks/`
- [ ] Create `index.tsx` for main component

### Phase 3: Backend/API Layer
- [ ] Define TypeScript types in `Codepush/types.ts`
- [ ] Add method to `CodepushService` (`Codepush/index.ts`)
- [ ] Add mock data support (when `DOTA_SERVER_URL=""`)
- [ ] Create API route in `app/routes/api.v1.*.ts`
- [ ] Test API route with mock data

### Phase 4: Data Layer
- [ ] Create data fetching functions in `data/` folder
- [ ] Create React Query hooks in `hooks/` folder
- [ ] Handle loading, error, and success states

### Phase 5: UI Layer
- [ ] Create main component using Mantine components
- [ ] Break down into smaller sub-components
- [ ] Add loading skeletons (Mantine Skeleton)
- [ ] Add error handling UI
- [ ] Add success notifications (Mantine Notifications)

### Phase 6: Testing & Polish
- [ ] Test feature manually
- [ ] Write unit tests (if applicable)
- [ ] Check responsive design
- [ ] Verify accessibility
- [ ] Update documentation

---

## 🎨 UI Development Guidelines

### Using Mantine Components

**1. Import from Mantine**
```typescript
import {
  Button,
  TextInput,
  Card,
  Stack,
  Group,
  Title,
  Text,
  Loader,
  Skeleton,
  Modal,
  Table,
  ActionIcon,
  Menu,
} from "@mantine/core";
```

**2. Use Mantine Hooks**
```typescript
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
```

**3. Layout Components**
- Use `Stack` for vertical layouts
- Use `Group` for horizontal layouts
- Use `Card` for content containers
- Use `Grid` for responsive grids

**Example:**
```typescript
export function MyFeature() {
  return (
    <Stack gap="md">
      <Card withBorder radius="md" p="xl">
        <Stack gap="lg">
          <Title order={2}>Feature Title</Title>
          <Group gap="sm">
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
```

**4. Forms with Mantine**
```typescript
import { useForm } from "@mantine/form";

export function MyForm() {
  const form = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) => (value.length > 0 ? null : "Name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Name"
        placeholder="Enter name"
        {...form.getInputProps("name")}
      />
      <Button type="submit" mt="md">Submit</Button>
    </form>
  );
}
```

**5. Loading States**
```typescript
import { Skeleton, Loader } from "@mantine/core";

// For skeleton loaders
{isLoading && <Skeleton height={50} />}

// For spinners
{isLoading && <Loader size="sm" />}
```

**6. Notifications**
```typescript
import { notifications } from "@mantine/notifications";

// Success
notifications.show({
  title: "Success",
  message: "Feature created successfully!",
  color: "green",
});

// Error
notifications.show({
  title: "Error",
  message: "Something went wrong",
  color: "red",
});
```

---

## 🧩 Component Breakdown Strategy

### When to Split a Component

**Split when:**
- Component exceeds ~150-200 lines
- Component has multiple responsibilities
- Logic can be reused elsewhere
- Improves readability

**Example: Large Table Component**

❌ **Before** - Single large component:
```typescript
// UserTable.tsx (300 lines)
export function UserTable() {
  // Table rendering
  // Row rendering
  // Action buttons
  // Modals
  // Filters
  // All logic mixed together
}
```

✅ **After** - Multiple focused components:
```typescript
// UserTable.tsx (80 lines)
export function UserTable() {
  return (
    <>
      <UserTableFilters />
      <Table>
        {data.map(user => <UserRow key={user.id} user={user} />)}
      </Table>
      <UserTablePagination />
    </>
  );
}

// UserRow.tsx (50 lines)
export function UserRow({ user }) {
  return (
    <Table.Tr>
      <Table.Td>{user.name}</Table.Td>
      <Table.Td><UserActions user={user} /></Table.Td>
    </Table.Tr>
  );
}

// UserActions.tsx (60 lines)
export function UserActions({ user }) {
  return (
    <Menu>
      <Menu.Item onClick={handleEdit}>Edit</Menu.Item>
      <Menu.Item onClick={handleDelete}>Delete</Menu.Item>
    </Menu>
  );
}
```

---

## 🔗 Data Fetching Pattern

### Standard Pattern for All Features

**1. Data Function** (`data/getFeature.ts`)
```typescript
import axios from "axios";

export type GetFeatureArgs = {
  userId: string;
  featureId: string;
};

export const getFeature = async (args: GetFeatureArgs) => {
  const response = await axios.get(`/api/v1/feature/${args.featureId}`, {
    params: { userId: args.userId },
  });
  return response.data;
};
```

**2. React Query Hook** (`hooks/useGetFeature.ts`)
```typescript
import { useQuery } from "react-query";
import { getFeature, GetFeatureArgs } from "../data/getFeature";

export const useGetFeature = (args: GetFeatureArgs) => {
  return useQuery({
    queryKey: ["feature", args.featureId],
    queryFn: () => getFeature(args),
    enabled: !!args.featureId,
  });
};
```

**3. Component Usage**
```typescript
import { useGetFeature } from "./hooks/useGetFeature";

export function FeatureComponent() {
  const { data, isLoading, error } = useGetFeature({
    userId: user.user.id,
    featureId: params.id,
  });

  if (isLoading) return <Skeleton height={100} />;
  if (error) return <Text color="red">Error loading feature</Text>;

  return <div>{/* Render data */}</div>;
}
```

---

## 📝 Naming Conventions

### Files and Folders
- **Components**: PascalCase - `MyComponent.tsx`
- **Hooks**: camelCase with "use" prefix - `useMyHook.ts`
- **Data functions**: camelCase - `getMyData.ts`, `createMyData.ts`
- **Types**: PascalCase - `MyType.ts` or inline in file
- **Folders**: PascalCase - `MyFeature/`

### Component Names
- **Main component**: Feature name - `CollaboratorList`, `ReleaseForm`
- **Sub-components**: Feature prefix - `CollaboratorRow`, `ReleaseMetadata`
- **Generic components**: Descriptive - `ConfirmDialog`, `ErrorBoundary`

### Hook Names
- **Data fetching**: `useGet...`, `useFetch...` - `useGetCollaborators`
- **Mutations**: `useCreate...`, `useUpdate...`, `useDelete...` - `useCreateApp`
- **UI state**: `use...` - `useModal`, `useToggle`

---

## ✅ Code Review Checklist

Before considering a feature complete:

### Code Quality
- [ ] Uses Mantine components exclusively
- [ ] Components are small and focused (<200 lines)
- [ ] No duplicate code (DRY principle)
- [ ] Proper TypeScript types everywhere
- [ ] No `any` types (use proper typing)
- [ ] Follows existing code patterns

### Feature Organization
- [ ] Feature folder created with proper structure
- [ ] All related code grouped together
- [ ] Clear separation: UI, data, hooks
- [ ] Sub-components in `components/` folder

### Functionality
- [ ] Feature works end-to-end
- [ ] Loading states handled properly
- [ ] Error states handled with user-friendly messages
- [ ] Success feedback (notifications)
- [ ] Edge cases considered

### User Experience
- [ ] Responsive design (works on mobile/tablet/desktop)
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Consistent with app design
- [ ] Smooth transitions and animations
- [ ] Clear error messages

### Data Layer
- [ ] Mock data support added (for local dev)
- [ ] API routes tested
- [ ] React Query caching configured
- [ ] Refetch/invalidation working properly

---

## 🚫 Common Mistakes to Avoid

### 1. **Using Multiple UI Libraries**
❌ DON'T:
```typescript
import { Button } from "some-other-library";
```
✅ DO:
```typescript
import { Button } from "@mantine/core";
```

### 2. **Large Monolithic Components**
❌ DON'T: Create 500-line components
✅ DO: Break into smaller, focused components

### 3. **Mixing Concerns**
❌ DON'T: Put API calls directly in components
✅ DO: Use data functions + React Query hooks

### 4. **Scattered Files**
❌ DON'T: Create files in random locations
✅ DO: Group all feature files in one folder

### 5. **Skipping Error Handling**
❌ DON'T: Ignore loading/error states
✅ DO: Handle all states with proper UI feedback

### 6. **Working on Multiple Features**
❌ DON'T: Start 5 features at once
✅ DO: Complete one feature fully before starting next

---

## 📚 Reference Examples

### Good Examples in Current Codebase

1. **CollaboratorList** (`app/components/Pages/components/CollaboratorList/`)
   - Well-organized folder structure
   - Separate components for row and actions
   - Clear data/hooks separation

2. **ReleaseForm** (`app/components/Pages/components/ReleaseForm/`)
   - Broken down into multiple sub-components
   - Reusable field components
   - Clean separation of concerns

3. **AppList** (`app/components/Pages/components/AppList/`)
   - Simple, focused component
   - Clear data fetching pattern
   - Good error handling

---

## 🎯 Quick Start Template

When creating a new feature, use this template:

```bash
# 1. Create feature folder
mkdir -p app/components/Pages/components/MyFeature/{components,data,hooks}

# 2. Create main component file
touch app/components/Pages/components/MyFeature/index.tsx

# 3. Create data fetching files
touch app/components/Pages/components/MyFeature/data/getMyFeature.ts
touch app/components/Pages/components/MyFeature/hooks/useGetMyFeature.ts

# 4. Create API route
touch app/routes/api.v1.my-feature.ts
```

**Starter Code:**

```typescript
// index.tsx
import { Stack, Card, Title, Text, Skeleton } from "@mantine/core";
import { useGetMyFeature } from "./hooks/useGetMyFeature";

export function MyFeature() {
  const { data, isLoading, error } = useGetMyFeature();

  if (isLoading) return <Skeleton height={200} />;
  if (error) return <Text color="red">Error loading feature</Text>;

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="lg">
        <Title order={2}>My Feature</Title>
        <Text>{/* Your content here */}</Text>
      </Stack>
    </Card>
  );
}
```

---

## 🤝 Summary

**Remember these key principles:**

1. ✅ **Mantine Only** - Use Mantine for all new UI
2. ✅ **One Feature at a Time** - Complete before moving on
3. ✅ **Small Components** - Keep them focused and under 200 lines
4. ✅ **Grouped Together** - All feature code in one folder

**When in doubt:**
- Look at existing features as examples
- Break it down into smaller pieces
- Use Mantine components
- Keep it simple and focused

---

**Happy Coding! 🚀**

