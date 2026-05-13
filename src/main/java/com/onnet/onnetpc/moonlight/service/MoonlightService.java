package com.onnet.onnetpc.moonlight.service;

import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.moonlight.dto.CreateSunshineHostRequest;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandLogItemResponse;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandRequest;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandResponse;
import com.onnet.onnetpc.moonlight.dto.SunshineHostResponse;
import com.onnet.onnetpc.moonlight.dto.UpdateSunshineHostRequest;
import com.onnet.onnetpc.moonlight.entity.MoonlightCommandLog;
import com.onnet.onnetpc.moonlight.entity.SunshineHost;
import com.onnet.onnetpc.moonlight.repository.MoonlightCommandLogRepository;
import com.onnet.onnetpc.moonlight.repository.SunshineHostRepository;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MoonlightService {

    private final SunshineHostRepository sunshineHostRepository;
    private final MoonlightCommandLogRepository moonlightCommandLogRepository;
    private final UserRepository userRepository;
    private final boolean cliEnabled;
    private final String cliPath;
    private final long cliTimeoutSeconds;
    private final boolean allowStreamCommand;

    public MoonlightService(
        SunshineHostRepository sunshineHostRepository,
        MoonlightCommandLogRepository moonlightCommandLogRepository,
        UserRepository userRepository,
        @Value("${app.moonlight.cli.enabled:false}") boolean cliEnabled,
        @Value("${app.moonlight.cli.path:moonlight}") String cliPath,
        @Value("${app.moonlight.cli.timeout-seconds:25}") long cliTimeoutSeconds,
        @Value("${app.moonlight.cli.allow-stream-command:false}") boolean allowStreamCommand
    ) {
        this.sunshineHostRepository = sunshineHostRepository;
        this.moonlightCommandLogRepository = moonlightCommandLogRepository;
        this.userRepository = userRepository;
        this.cliEnabled = cliEnabled;
        this.cliPath = cliPath;
        this.cliTimeoutSeconds = cliTimeoutSeconds;
        this.allowStreamCommand = allowStreamCommand;
    }

    @Transactional(readOnly = true)
    public List<SunshineHostResponse> listAdminHosts() {
        return sunshineHostRepository.findAllByOrderByNameAsc().stream().map(this::toHostResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SunshineHostResponse> listEnabledHosts() {
        return sunshineHostRepository.findAllByEnabledTrueOrderByNameAsc().stream().map(this::toHostResponse).toList();
    }

    @Transactional
    public SunshineHostResponse createHost(String requesterEmail, CreateSunshineHostRequest request) {
        User requester = findUserByEmail(requesterEmail);

        SunshineHost host = new SunshineHost();
        host.setName(trimRequired(request.name(), "name"));
        host.setHostAddress(trimRequired(request.hostAddress(), "hostAddress"));
        host.setHostPort(request.hostPort() == null ? 47989 : request.hostPort());
        host.setEnabled(request.enabled() == null ? Boolean.TRUE : request.enabled());
        host.setNotes(trimNullable(request.notes()));
        host.setCreatedBy(requester);
        host.setUpdatedAt(Instant.now());

        SunshineHost saved = sunshineHostRepository.save(host);
        return toHostResponse(saved);
    }

    @Transactional
    public SunshineHostResponse updateHost(Long hostId, UpdateSunshineHostRequest request) {
        SunshineHost host = findHostById(hostId);

        if (request.name() != null) {
            host.setName(trimRequired(request.name(), "name"));
        }
        if (request.hostAddress() != null) {
            host.setHostAddress(trimRequired(request.hostAddress(), "hostAddress"));
        }
        if (request.hostPort() != null) {
            host.setHostPort(request.hostPort());
        }
        if (request.enabled() != null) {
            host.setEnabled(request.enabled());
        }
        if (request.notes() != null) {
            host.setNotes(trimNullable(request.notes()));
        }

        host.setUpdatedAt(Instant.now());
        SunshineHost saved = sunshineHostRepository.save(host);
        return toHostResponse(saved);
    }

    @Transactional
    public String deleteHost(Long hostId) {
        SunshineHost host = findHostById(hostId);
        sunshineHostRepository.delete(host);
        return "Sunshine host removed";
    }

    @Transactional
    public MoonlightCommandResponse runAdminCommand(String requesterEmail, Long hostId, MoonlightCommandRequest request) {
        User requester = findUserByEmail(requesterEmail);
        return runCommand(hostId, requester, request);
    }

    @Transactional
    public MoonlightCommandResponse runUserLaunch(String requesterEmail, Long hostId, MoonlightCommandRequest request) {
        User requester = findUserByEmail(requesterEmail);

        MoonlightCommandRequest normalized = new MoonlightCommandRequest(
            normalizeAction(request.action()),
            request.pin(),
            request.appName(),
            request.resolution(),
            request.fps(),
            request.bitrateKbps(),
            // User launches are client-owned; the backend must not occupy the Sunshine stream.
            false
        );

        return runCommand(hostId, requester, normalized);
    }

    @Transactional
    public MoonlightCommandResponse startUserStreamOnServer(
        String requesterEmail,
        Long hostId,
        MoonlightCommandRequest request
    ) {
        User requester = findUserByEmail(requesterEmail);

        MoonlightCommandRequest normalized = new MoonlightCommandRequest(
            "STREAM",
            null,
            request.appName(),
            request.resolution(),
            request.fps(),
            request.bitrateKbps(),
            true
        );

        return runCommand(hostId, requester, normalized);
    }

    @Transactional(readOnly = true)
    public List<MoonlightCommandLogItemResponse> listRecentLogs(Long hostId) {
        findHostById(hostId);
        return moonlightCommandLogRepository.findTop20ByHostIdOrderByCreatedAtDesc(hostId).stream()
            .map(this::toLogItemResponse)
            .toList();
    }

    private MoonlightCommandResponse runCommand(Long hostId, User requester, MoonlightCommandRequest request) {
        SunshineHost host = findHostById(hostId);
        if (!Boolean.TRUE.equals(host.getEnabled())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected Sunshine host is disabled");
        }

        String action = normalizeAction(request.action());
        List<String> command = buildCommand(host, action, request);
        String commandText = String.join(" ", command);
        boolean executeRequested = Boolean.TRUE.equals(request.executeOnServer());

        MoonlightCommandLog log = new MoonlightCommandLog();
        log.setHost(host);
        log.setRequestedBy(requester);
        log.setAction(action);
        log.setCommandText(commandText);
        log.setStatus("PREPARED");
        log.setCreatedAt(Instant.now());
        moonlightCommandLogRepository.save(log);

        if (!executeRequested) {
            return toCommandResponse(
                log,
                false,
                "Command prepared. Run it on your Moonlight-capable machine if server execution is not needed."
            );
        }

        if (!cliEnabled) {
            return toCommandResponse(
                log,
                false,
                "Server execution disabled. Set app.moonlight.cli.enabled=true to run moonlight from backend."
            );
        }

        if ("STREAM".equals(action) && !allowStreamCommand) {
            return toCommandResponse(
                log,
                false,
                "Stream command execution is disabled on server. Set app.moonlight.cli.allow-stream-command=true if you want it."
            );
        }

        CommandExecutionResult result = "STREAM".equals(action)
            ? startStreamingCommand(command)
            : executeCommand(command);
        log.setStatus(result.success() ? ("STREAM".equals(action) ? "STARTED" : "SUCCESS") : "FAILED");
        log.setOutputText(result.output());
        log.setFinishedAt(Instant.now());
        moonlightCommandLogRepository.save(log);

        String message = result.success()
            ? ("STREAM".equals(action) ? "Moonlight stream started." : "Moonlight command executed successfully.")
            : "Moonlight command failed.";
        return toCommandResponse(log, true, message);
    }

    private List<String> buildCommand(SunshineHost host, String action, MoonlightCommandRequest request) {
        String endpoint = toEndpoint(host);
        List<String> command = new ArrayList<>();
        command.add(cliPath);

        switch (action) {
            case "PAIR" -> {
                command.add("pair");
                command.add(endpoint);
                String pin = trimNullable(request.pin());
                if (pin != null && !pin.isBlank()) {
                    command.add("--pin");
                    command.add(pin);
                }
            }
            case "PROBE" -> {
                command.add("list");
                command.add(endpoint);
            }
            case "STREAM" -> {
                command.add("stream");
                command.add(endpoint);

                String appName = trimNullable(request.appName());
                if (appName != null && !appName.isBlank()) {
                    command.add(appName);
                }

                String resolution = normalizeResolution(request.resolution());
                if (resolution != null) {
                    command.add(resolution);
                }

                if (request.fps() != null) {
                    command.add("-fps");
                    command.add(String.valueOf(request.fps()));
                }

                if (request.bitrateKbps() != null) {
                    command.add("-bitrate");
                    command.add(String.valueOf(request.bitrateKbps()));
                }
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported action: " + action);
        }

        return command;
    }

    private CommandExecutionResult executeCommand(List<String> command) {
        Process process = null;
        try {
            process = new ProcessBuilder(command)
                .redirectErrorStream(true)
                .start();

            boolean finished = process.waitFor(cliTimeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new CommandExecutionResult(false, "Timed out after " + cliTimeoutSeconds + "s");
            }

            String output = readAll(process);
            boolean success = process.exitValue() == 0;
            return new CommandExecutionResult(success, output == null ? "" : output.trim());
        } catch (IOException e) {
            return new CommandExecutionResult(false, "Failed to run moonlight command: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CommandExecutionResult(false, "Command interrupted: " + e.getMessage());
        }
    }

    private CommandExecutionResult startStreamingCommand(List<String> command) {
        try {
            Process process = new ProcessBuilder(command)
                .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                .redirectError(ProcessBuilder.Redirect.DISCARD)
                .start();
            return new CommandExecutionResult(true, "Started Moonlight stream process pid=" + process.pid());
        } catch (IOException e) {
            return new CommandExecutionResult(false, "Failed to start moonlight stream: " + e.getMessage());
        }
    }

    private String readAll(Process process) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append(System.lineSeparator());
            }
        } catch (IOException e) {
            return "Could not read process output: " + e.getMessage();
        }
        return sb.toString();
    }

    private String toEndpoint(SunshineHost host) {
        String address = trimRequired(host.getHostAddress(), "hostAddress");
        int port = host.getHostPort() == null ? 47989 : host.getHostPort();
        if (port == 47989) {
            return address;
        }
        return address + ":" + port;
    }

    private String normalizeAction(String action) {
        String normalized = (action == null || action.isBlank()) ? "STREAM" : action.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "STREAM", "PAIR", "PROBE" -> normalized;
            case "LIST" -> "PROBE";
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "action must be one of STREAM, PAIR, PROBE");
        };
    }

    private String normalizeResolution(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "720", "720p", "-720" -> "-720";
            case "1080", "1080p", "-1080" -> "-1080";
            case "1440", "1440p", "-1440" -> "-1440";
            case "4k", "2160", "2160p", "-4k" -> "-4k";
            default -> null;
        };
    }

    private SunshineHost findHostById(Long hostId) {
        return sunshineHostRepository.findById(hostId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sunshine host not found"));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private SunshineHostResponse toHostResponse(SunshineHost host) {
        return new SunshineHostResponse(
            host.getId(),
            host.getName(),
            host.getHostAddress(),
            host.getHostPort(),
            host.getEnabled(),
            host.getNotes(),
            host.getCreatedBy() == null ? null : host.getCreatedBy().getId(),
            host.getCreatedAt(),
            host.getUpdatedAt()
        );
    }

    private MoonlightCommandResponse toCommandResponse(MoonlightCommandLog log, boolean executedOnServer, String message) {
        return new MoonlightCommandResponse(
            log.getId(),
            log.getHost().getId(),
            log.getAction(),
            log.getStatus(),
            executedOnServer,
            log.getCommandText(),
            log.getOutputText(),
            message,
            log.getCreatedAt(),
            log.getFinishedAt()
        );
    }

    private MoonlightCommandLogItemResponse toLogItemResponse(MoonlightCommandLog log) {
        return new MoonlightCommandLogItemResponse(
            log.getId(),
            log.getHost().getId(),
            log.getRequestedBy() == null ? null : log.getRequestedBy().getId(),
            log.getAction(),
            log.getCommandText(),
            log.getStatus(),
            log.getOutputText(),
            log.getCreatedAt(),
            log.getFinishedAt()
        );
    }

    private String trimRequired(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value.trim();
    }

    private String trimNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record CommandExecutionResult(boolean success, String output) {}
}
