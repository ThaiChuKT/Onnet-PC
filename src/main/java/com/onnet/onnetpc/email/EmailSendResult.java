package com.onnet.onnetpc.email;

public record EmailSendResult(
    boolean sent,
    String provider,
    String errorType,
    String errorMessage
) {
    public static EmailSendResult sent(String provider) {
        return new EmailSendResult(true, provider, null, null);
    }

    public static EmailSendResult failed(String provider, Throwable throwable) {
        Throwable root = rootCause(throwable);
        return new EmailSendResult(false, provider, root.getClass().getName(), root.getMessage());
    }

    private static Throwable rootCause(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current;
    }
}
