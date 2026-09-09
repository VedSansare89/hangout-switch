import { HangoutSwitchApp } from "@/components/hangout-switch-app";

export default async function JoinRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <HangoutSwitchApp initialRoomCode={code.toUpperCase()} />;
}
