import { auth } from '@clerk/nextjs/server';

export async function getEffectiveClerkId(): Promise<string | null> {
  const { userId } = auth();
  return userId ?? null;
}
