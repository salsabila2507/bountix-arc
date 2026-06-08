"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  MessageCircleMore,
  MessagesSquare,
  Plus,
  Users,
} from "lucide-react";
import {
  Chat,
  ChatHeader,
  ConversationList,
  LoginStatus,
  MessageInput,
  MessageList,
  UIKitProvider,
  useConversationListState,
  useLoginState,
} from "@tencentcloud/chat-uikit-react";
import TUIChatEngine from "@tencentcloud/chat-uikit-engine-lite";
import type { TencentChatPeer, TencentChatSession } from "@/lib/tencent-chat";

type TencentChatShellProps = {
  session: TencentChatSession;
  peers: TencentChatPeer[];
  locale: "en" | "id" | "zh";
  initialPeerUserId?: string | null;
};

function toUIKitLanguage(locale: TencentChatShellProps["locale"]) {
  return locale === "zh" ? "zh-CN" : "en-US";
}

function getDisplayName(peer: TencentChatPeer) {
  return peer.display_name?.trim() || `@${peer.username}`;
}

function getAvatarFallback(peer: TencentChatPeer) {
  return (peer.display_name ?? peer.username).slice(0, 2).toUpperCase();
}

export function TencentChatShell({
  session,
  peers,
  locale,
  initialPeerUserId = null,
}: TencentChatShellProps) {
  return (
    <UIKitProvider theme="light" language={toUIKitLanguage(locale)}>
      <TencentChatWorkspace
        session={session}
        peers={peers}
        locale={locale}
        initialPeerUserId={initialPeerUserId}
      />
    </UIKitProvider>
  );
}

function TencentChatWorkspace({
  session,
  peers,
  initialPeerUserId,
}: TencentChatShellProps) {
  const { status } = useLoginState({
    SDKAppID: session.sdkAppId,
    userID: session.userId,
    userSig: session.userSig,
  });
  const {
    conversationList = [],
    activeConversation,
    totalUnRead = 0,
    createC2CConversation,
    createGroupConversation,
    setActiveConversation,
  } = useConversationListState();
  const [selectedPeerIds, setSelectedPeerIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const enableReadReceipt = String(activeConversation?.type) === "c2c";

  const selectedPeers = useMemo(
    () =>
      peers.filter((peer) => selectedPeerIds.includes(peer.tencent_user_id)),
    [peers, selectedPeerIds],
  );

  useEffect(() => {
    if (status !== LoginStatus.SUCCESS) return;
    const peerUserId = initialPeerUserId;
    if (!peerUserId) return;

    let cancelled = false;

    async function openPeerConversation() {
      try {
        const conversation = await createC2CConversation(peerUserId as string);
        if (!cancelled) {
          setActiveConversation(conversation.conversationID);
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            error instanceof Error
              ? error.message
              : "Could not open the linked conversation.",
          );
        }
      }
    }

    void openPeerConversation();

    return () => {
      cancelled = true;
    };
  }, [
    createC2CConversation,
    setActiveConversation,
    status,
    initialPeerUserId,
  ]);

  useEffect(() => {
    if (status !== LoginStatus.SUCCESS) return;
    if (initialPeerUserId) return;
    if (activeConversation || conversationList.length === 0) return;

    setActiveConversation(conversationList[0].conversationID);
  }, [
    activeConversation,
    conversationList,
    initialPeerUserId,
    setActiveConversation,
    status,
  ]);

  async function handleOpenPeer(peerUserId: string) {
    setStatusMessage(null);
    try {
      const conversation = await createC2CConversation(peerUserId);
      setActiveConversation(conversation.conversationID);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Could not open this conversation.",
      );
    }
  }

  function togglePeerSelection(peerUserId: string) {
    setSelectedPeerIds((current) =>
      current.includes(peerUserId)
        ? current.filter((id) => id !== peerUserId)
        : [...current, peerUserId],
    );
  }

  async function handleCreateGroup() {
    setStatusMessage(null);
    if (selectedPeers.length < 2) {
      setStatusMessage("Select at least 2 people to create a group.");
      return;
    }

    setIsCreating(true);
    try {
      const conversation = await createGroupConversation({
        name: groupName.trim() || "Bountix group",
        type: TUIChatEngine.TYPES.GRP_WORK,
        joinOption: TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS,
        memberList: selectedPeers.map((peer) => ({
          userID: peer.tencent_user_id,
        })),
      });
      setActiveConversation(conversation.conversationID);
      setSelectedPeerIds([]);
      setGroupName("");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Could not create the group.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (status !== LoginStatus.SUCCESS) {
    return (
      <div className="comic-card-soft mt-6 bg-white p-6 text-center">
        <p className="comic-chip bg-[#38e7ff]">
          <MessageCircleMore aria-hidden="true" className="h-3.5 w-3.5" />
          Realtime chat
        </p>
        <p className="mt-5 text-sm font-bold leading-6 text-[#5a3b66]">
          Connecting to Tencent Chat...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="comic-card-soft flex min-h-[640px] flex-col bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="comic-chip bg-[#38e7ff]">
              <MessagesSquare aria-hidden="true" className="h-3.5 w-3.5" />
              Conversations
            </p>
            <h2 className="mt-4 text-2xl font-black uppercase text-[#140625]">
              Realtime chat
            </h2>
          </div>
          <span className="inline-flex min-h-10 items-center rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
            {totalUnRead} unread
          </span>
        </div>

        <div className="mt-4 flex-1 overflow-hidden rounded-lg border-2 border-[#140625] bg-[#fffaf4] shadow-[3px_3px_0_#140625]">
          <ConversationList enableSearch={false} enableCreate={false} />
        </div>

        <div className="mt-4 rounded-lg border-2 border-[#140625] bg-[#f8f0ff] p-4 shadow-[3px_3px_0_#140625]">
          <div className="flex items-center gap-2">
            <Users aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
            <h3 className="text-sm font-black uppercase text-[#140625]">
              Start a chat
            </h3>
          </div>
          <p className="mt-2 text-xs font-bold leading-5 text-[#5a3b66]">
            Select a Bountix profile to open a 1:1 chat, or pick multiple
            profiles to create a group.
          </p>

          <div className="mt-4 grid gap-2">
            {peers.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed border-[#140625] bg-white p-3 text-xs font-bold text-[#5a3b66]">
                No peer profiles found yet.
              </p>
            ) : (
              peers.map((peer) => {
                const isSelected = selectedPeerIds.includes(peer.tencent_user_id);
                return (
                  <div
                    key={peer.id}
                    className="flex items-center gap-3 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 shadow-[2px_2px_0_#140625]"
                  >
                    <button
                      type="button"
                      onClick={() => togglePeerSelection(peer.tencent_user_id)}
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 border-[#140625] ${
                        isSelected ? "bg-[#38e7ff]" : "bg-[#fffaf4]"
                      }`}
                      aria-label={`Select ${getDisplayName(peer)}`}
                    >
                      {isSelected ? (
                        <Check aria-hidden="true" className="h-3 w-3" />
                      ) : null}
                    </button>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-[#140625] bg-[#ffdd3d] text-[0.65rem] font-black text-[#140625]">
                        {peer.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={peer.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getAvatarFallback(peer)
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#140625]">
                          {getDisplayName(peer)}
                        </p>
                        <p className="truncate text-[0.7rem] font-bold text-[#5a3b66]">
                          {peer.role} · {peer.tencent_user_id}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleOpenPeer(peer.tencent_user_id)}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 py-1.5 text-[0.65rem] font-black uppercase text-[#140625] shadow-[2px_2px_0_#140625] transition hover:bg-[#ffdd3d]"
                    >
                      Open
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border-2 border-[#140625] bg-white p-3">
            <label className="block">
              <span className="text-xs font-black uppercase text-[#140625]">
                Group name
              </span>
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Bountix crew"
                className="mt-2 h-11 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 text-sm font-medium text-[#140625] outline-none focus:ring-2 focus:ring-[#38e7ff]"
              />
            </label>

            <p className="text-xs font-bold text-[#5a3b66]">
              Selected members: {selectedPeers.length}
            </p>

            <button
              type="button"
              onClick={() => void handleCreateGroup()}
              disabled={isCreating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              {isCreating ? "Creating..." : "Create group"}
            </button>
          </div>

          {statusMessage ? (
            <p className="mt-3 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-xs font-bold text-[#8a1742]">
              {statusMessage}
            </p>
          ) : null}
        </div>
      </aside>

      <section className="comic-card-soft min-h-[640px] bg-white p-3 sm:p-4">
        <div className="flex h-full flex-col">
          <Chat style={{ width: "100%" }}>
            <ChatHeader />
            <MessageList enableReadReceipt={enableReadReceipt} />
            <MessageInput />
          </Chat>
        </div>
      </section>
    </div>
  );
}
