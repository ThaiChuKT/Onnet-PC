package com.onnet.onnetpc.admin.dto;

public record EmailTestResponse(
    boolean sent,
    String provider,
    String host,
    int port,
    String username,
    String fromAddress,
    String errorType,
    String errorMessage
) {
}
