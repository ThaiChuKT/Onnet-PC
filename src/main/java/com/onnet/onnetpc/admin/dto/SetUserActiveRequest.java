package com.onnet.onnetpc.admin.dto;

import jakarta.validation.constraints.NotNull;

public record SetUserActiveRequest(@NotNull(message = "active is required") Boolean active) {
}
