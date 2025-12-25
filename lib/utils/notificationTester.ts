// Test utility for real-time notifications
// Add this to your browser console to test notifications

export const NotificationTester = {
  // Test different notification types
  testInfo: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "notification:new",
          data: {
            message: "This is an info notification test",
            type: "info",
          },
        },
      })
    );
  },

  testSuccess: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "notification:new",
          data: {
            message: "This is a success notification test",
            type: "success",
          },
        },
      })
    );
  },

  testWarning: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "notification:new",
          data: {
            message: "This is a warning notification test",
            type: "warning",
          },
        },
      })
    );
  },

  testError: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "notification:new",
          data: {
            message: "This is an error notification test",
            type: "error",
          },
        },
      })
    );
  },

  // Test parcel events
  testParcelDelivered: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "parcel:delivered",
          data: {
            parcel: {
              trackingNumber: "TEST123456",
              status: "delivered",
              customerId: "user-id-here",
            },
          },
        },
      })
    );
  },

  testNewBooking: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "parcel:new-booking",
          data: {
            parcel: {
              trackingNumber: "TEST789012",
              status: "pending",
            },
          },
        },
      })
    );
  },

  testParcelAssigned: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "parcel:assigned",
          data: {
            parcel: {
              trackingNumber: "TEST345678",
            },
            agentId: "agent-id-here",
          },
        },
      })
    );
  },

  testPaymentReceived: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "payment:received",
          data: {
            parcel: {
              trackingNumber: "TEST901234",
              assignedAgent: "agent-id-here",
            },
            amount: 150,
          },
        },
      })
    );
  },

  testUrgentParcel: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "parcel:urgent",
          data: {
            parcel: {
              trackingNumber: "URGENT567890",
              assignedAgent: "agent-id-here",
            },
            priority: "high",
          },
        },
      })
    );
  },

  testDeliveryFailed: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "parcel:failed",
          data: {
            parcel: {
              trackingNumber: "FAIL123456",
              customerId: "user-id-here",
              assignedAgent: "agent-id-here",
            },
            reason: "Customer not available",
          },
        },
      })
    );
  },

  // Test agent events
  testAgentOnline: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "agent:online-status",
          data: {
            agentId: "agent-id-here",
            agentName: "John Doe",
            isOnline: true,
          },
        },
      })
    );
  },

  testRouteUpdated: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "route:updated",
          data: {
            routeId: "route-123",
            parcelsCount: 8,
          },
        },
      })
    );
  },

  // Test system events
  testSystemAlert: () => {
    window.dispatchEvent(
      new CustomEvent("socket:test", {
        detail: {
          event: "system:alert",
          data: {
            message: "System maintenance scheduled at 2 AM",
            level: "warning",
          },
        },
      })
    );
  },

  // Spam test for UI performance
  testSpam: () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("socket:test", {
            detail: {
              event: "notification:new",
              data: {
                message: `Test notification ${i + 1}`,
                type: i % 2 === 0 ? "info" : "success",
              },
            },
          })
        );
      }, i * 500);
    }
  },
};

// Make it available globally for console testing
if (typeof window !== "undefined") {
  (window as any).notificationTest = NotificationTester;
}

// Usage in browser console:
// notificationTest.testSuccess()
// notificationTest.testParcelDelivered()
// notificationTest.testSpam()
