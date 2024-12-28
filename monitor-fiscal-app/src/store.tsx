import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { apiSlice } from "./services/http";
import dialogModalReducer from "./hook/handle-modal";
import filterSliceReducer from "./hook/handle-elements";
import { DialogModalState } from "./hook/handle-modal/types";
import { FilterElementsAssignment } from "./hook/handle-elements/types";

export interface ApplicationState {
  [apiSlice.reducerPath]: ReturnType<typeof apiSlice.reducer>;
  dialogModal: DialogModalState;
  handleElements: FilterElementsAssignment;
}

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  dialogModal: dialogModalReducer,
  handleElements: filterSliceReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
