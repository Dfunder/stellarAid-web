# Redux Store Structure

This project uses a **feature-based Redux architecture** that organizes code by domain/feature rather than by file type. This approach improves maintainability and makes it easier to find all code related to a specific feature.

## Directory Structure

```
app/
├── features/              # Feature-based modules
│   ├── auth/             # Authentication feature
│   ├── campaigns/        # Campaigns management feature
│   ├── donations/        # Donations processing feature
│   ├── dashboard/        # Dashboard analytics feature
│   ├── admin/            # Admin panel feature
│   └── bookmarks/        # Bookmarks/favorites feature
└── store/                # Redux store configuration
    ├── slices/           # Shared API slices
    ├── hooks.ts          # Typed Redux hooks
    ├── index.ts          # Store configuration
    └── rootReducer.ts    # Combined root reducer
```

## Feature Folder Structure

Each feature folder contains three standard files:

### 1. `[feature]Slice.ts`

Contains the Redux slice definition with:

- State interface
- Initial state
- Reducers and actions
- Default export of the slice reducer

Example:

```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { ... },
    clearUser: (state) => { ... },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
```

### 2. `[feature]Thunks.ts`

Contains async thunks for side effects and API calls:

- Uses `createAsyncThunk` from Redux Toolkit
- Handles async operations like API calls
- Dispatches slice actions to manage state

Example:

```typescript
// authThunks.ts
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { dispatch }) => {
  // API call logic here
});
```

### 3. `[feature]Selectors.ts`

Contains reselect functions to access state:

- Memoized selectors for derived data
- Type-safe state access
- Encapsulates state shape from components

Example:

```typescript
// authSelectors.ts
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
```

## Adding a New Feature

1. Create a new folder in `app/features/[your-feature]/`
2. Create the three required files:
   - `yourFeatureSlice.ts`
   - `yourFeatureThunks.ts`
   - `yourFeatureSelectors.ts`
3. Add the reducer to `app/store/rootReducer.ts`
4. Start using the feature in your components!

## Usage in Components

```typescript
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/app/features/auth/authSelectors';
import { loginUser } from '@/app/features/auth/authThunks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogin = (credentials) => {
    dispatch(loginUser(credentials));
  };

  // ...
}
```

## Benefits of This Structure

- **Colocation**: All code for a feature lives in one place
- **Maintainability**: Easy to find and update feature-specific code
- **Scalability**: New features can be added without disrupting existing code
- **Type Safety**: Full TypeScript support throughout the stack
- **Testability**: Features are self-contained and easier to test
