"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createRoomMutationGuard, type RoomMutationAction } from "@/features/rooms/mutation-guard";
import type { AdminActionResult } from "@/lib/actions/result";

type RoomMutationContextValue = {
  readonly guard: ReturnType<typeof createRoomMutationGuard>;
  readonly busy: boolean;
  readonly addressDirty: boolean;
  readonly setAddressDirty: (dirty: boolean) => void;
};

const RoomMutationContext = createContext<RoomMutationContextValue | null>(null);

export function RoomMutationProvider({ children }: { readonly children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [addressDirty, setAddressDirty] = useState(false);
  const [guard] = useState(() => createRoomMutationGuard(setBusy));
  return <RoomMutationContext value={{ guard, busy, addressDirty, setAddressDirty }}>{children}</RoomMutationContext>;
}

export function useRoomMutationState() {
  const context = useContext(RoomMutationContext);
  if (context === null) throw new Error("RoomMutationProvider is required");
  return context;
}

export function useRoomMutationAction(action: RoomMutationAction) {
  const context = useRoomMutationState();
  return {
    ...context,
    action: (previous: AdminActionResult, formData: FormData) => context.guard.run(action, previous, formData),
  };
}
