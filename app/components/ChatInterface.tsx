"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Search, Send, UserPlus } from "lucide-react";

type Friend = {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  addedAt?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
};

type FetchState = "idle" | "loading" | "error";

export default function ChatInterface() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsState, setFriendsState] = useState<FetchState>("idle");
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesState, setMessagesState] = useState<FetchState>("idle");
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [newHandle, setNewHandle] = useState("");
  const [addFriendState, setAddFriendState] = useState<FetchState>("idle");
  const [addFriendError, setAddFriendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) ?? null,
    [friends, selectedFriendId],
  );

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFriends = async () => {
    setFriendsState("loading");
    setFriendsError(null);
    try {
      const response = await fetch("/api/chat/friends", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to load friends");
      }
      const items: Friend[] = Array.isArray(data?.friends) ? data.friends : [];
      setFriends(items);
      if (items.length > 0) {
        setSelectedFriendId((prev) => {
          if (prev && items.some((friend) => friend.id === prev)) {
            return prev;
          }
          return items[0].id;
        });
      } else {
        setSelectedFriendId(null);
      }
      setFriendsState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load friends";
      setFriendsError(message);
      setFriendsState("error");
    }
  };

  const loadMessages = async (friendId: string) => {
    setMessagesState("loading");
    setMessagesError(null);
    try {
      const response = await fetch(`/api/chat/messages?friendId=${encodeURIComponent(friendId)}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to load messages");
      }
      const items: ChatMessage[] = Array.isArray(data?.messages)
        ? data.messages
        : [];
      setMessages(items);
      setMessagesState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load messages";
      setMessagesError(message);
      setMessagesState("error");
    }
  };

  useEffect(() => {
    void loadFriends();
  }, []);

  useEffect(() => {
    if (selectedFriendId) {
      void loadMessages(selectedFriendId);
    } else {
      setMessages([]);
    }
  }, [selectedFriendId]);

  const handleAddFriend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newHandle.trim()) {
      setAddFriendError("Enter a social handle to add a traveler.");
      return;
    }
    setAddFriendState("loading");
    setAddFriendError(null);
    try {
      const response = await fetch("/api/chat/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: newHandle }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to add traveler");
      }
      if (data?.friend) {
        setFriends((prev) => {
          const exists = prev.some((friend) => friend.id === data.friend.id);
          if (exists) {
            return prev;
          }
          return [data.friend, ...prev];
        });
        setSelectedFriendId(data.friend.id);
      }
      setNewHandle("");
      setAddFriendState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add traveler";
      setAddFriendError(message);
      setAddFriendState("error");
    }
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFriendId) {
      setMessagesError("Select a traveler to start chatting.");
      return;
    }
    const trimmed = newMessage.trim();
    if (!trimmed) {
      return;
    }
    setIsSending(true);
    setMessagesError(null);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: selectedFriendId, message: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send message");
      }
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      setNewMessage("");
      setIsSending(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send message";
      setMessagesError(message);
      setIsSending(false);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MessageCircle className="h-5 w-5 text-amber-300" />
          Real-time friends list
        </div>
        <form onSubmit={handleAddFriend} className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <input
              type="text"
              value={newHandle}
              onChange={(event) => setNewHandle(event.target.value)}
              placeholder="Add by @social_handle"
              className="w-full rounded-2xl border border-white/10 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={addFriendState === "loading"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {addFriendState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding traveler…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Add friend
              </>
            )}
          </button>
        </form>
        {addFriendError && (
          <p className="mt-3 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">
            {addFriendError}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-white/60">
            Your friends
          </div>
          {friendsState === "loading" && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}
          {friendsError && (
            <p className="text-xs text-rose-200">{friendsError}</p>
          )}
          <div className="space-y-2">
            {friends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => setSelectedFriendId(friend.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  friend.id === selectedFriendId
                    ? "border-amber-300/70 bg-amber-400/10"
                    : "border-white/10 bg-transparent hover:border-amber-200/40"
                }`}
              >
                <p className="font-semibold">{friend.name}</p>
                <p className="text-xs text-white/60">{friend.handle}</p>
                {friend.bio && (
                  <p className="mt-1 text-xs text-white/50 line-clamp-2">{friend.bio}</p>
                )}
              </button>
            ))}
            {friends.length === 0 && friendsState === "idle" && (
              <p className="text-sm text-white/60">
                Add travelers by their social handle to start chatting.
              </p>
            )}
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white flex flex-col">
        {selectedFriend ? (
          <>
            <header className="border-b border-white/10 pb-4">
              <p className="text-sm uppercase tracking-wide text-white/60">
                Chatting with
              </p>
              <h2 className="text-2xl font-semibold">{selectedFriend.name}</h2>
              <p className="text-sm text-white/60">{selectedFriend.handle}</p>
            </header>

            <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-2">
              {messagesState === "loading" && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading conversation…
                </div>
              )}
              {messagesError && (
                <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {messagesError}
                </p>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === selectedFriend.id ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-md rounded-2xl border px-4 py-3 text-sm ${
                      message.senderId === selectedFriend.id
                        ? "border-white/15 bg-white/10 text-white"
                        : "border-amber-300/60 bg-amber-400/10 text-amber-50"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.body}</p>
                    <p className="mt-1 text-[11px] text-white/60">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder={`Send a message to ${selectedFriend.name}`}
                  rows={3}
                  className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                />
                {messagesError && (
                  <p className="mt-2 text-sm text-rose-200">{messagesError}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/70">
            <MessageCircle className="h-12 w-12 text-amber-300" />
            <p className="mt-3 text-lg font-semibold">No traveler selected</p>
            <p className="text-sm">Add a friend on the left to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
}
