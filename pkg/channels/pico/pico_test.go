package pico

import (
	"context"
	"errors"
	"testing"

	"github.com/sipeed/picoclaw/pkg/bus"
	"github.com/sipeed/picoclaw/pkg/channels"
	"github.com/sipeed/picoclaw/pkg/config"
)

func newTestPicoChannel(t *testing.T) *PicoChannel {
	t.Helper()

	cfg := config.PicoConfig{}
	cfg.SetToken("test-token")
	ch, err := NewPicoChannel(cfg, bus.NewMessageBus())
	if err != nil {
		t.Fatalf("NewPicoChannel: %v", err)
	}

	ch.ctx = context.Background()
	return ch
}

func TestBroadcastToSession_TargetsOnlyRequestedSession(t *testing.T) {
	ch := newTestPicoChannel(t)

	target := &picoConn{id: "target", sessionID: "s-target"}
	target.closed.Store(true)
	ch.addSubscriberForTest(target)

	other := &picoConn{id: "other", sessionID: "s-other"}
	ch.addSubscriberForTest(other)

	err := ch.broadcastToSession("pico:s-target", newMessage(TypeMessageCreate, map[string]any{"content": "hello"}))
	if err == nil {
		t.Fatal("expected send failure due to closed target connection")
	}
	if !errors.Is(err, channels.ErrSendFailed) {
		t.Fatalf("expected ErrSendFailed, got %v", err)
	}
}

func (c *PicoChannel) addSubscriberForTest(sub picoSubscriber) {
	c.subscribers.Store(sub.ID(), sub)
	c.connCount.Add(1)
}
