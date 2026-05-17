package com.onnet.onnetpc.admin.dto;

public record EmailTestResponse(
    boolean sent,
    String host,
    int port,
    String username,
    String fromAddress,
    String errorType,
    String errorMessage
) {
}
